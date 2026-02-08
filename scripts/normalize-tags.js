import 'dotenv/config';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// --------------------
// Config
// --------------------
const BATCH_SIZE = 200;      // number of unique tags per batch
const RATE_LIMIT_MS = 2000; // wait between OpenAI calls
const MAX_RETRIES = 5;

// --------------------
// Supabase
// --------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------
// OpenAI call
// --------------------
async function categorizeTags(tags, attempt = 1) {
  const prompt = `
You are categorizing tags for a wallpaper website.

Rules:
- Assign each tag to one broad category (like "city", "country", "nature", "animal", "landscape", "people")
- Only assign one category per tag
- Output a JSON object with tags as keys and categories as values
- Proper nouns like cities/countries can remain as "city" or "country"

Input tags: ${JSON.stringify(tags)}

Output:
JSON object
`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if ((res.status === 429 || res.status === 503) && attempt <= MAX_RETRIES) {
        const wait = RATE_LIMIT_MS * attempt;
        console.warn(`⚠️ Rate limit / service error. Retrying in ${wait}ms... (attempt ${attempt})`);
        await sleep(wait);
        return categorizeTags(tags, attempt + 1);
      }
      throw new Error(`OpenAI error ${res.status}: ${text}`);
    }

    const json = await res.json();
    return JSON.parse(json.choices[0].message.content.trim());
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      const wait = RATE_LIMIT_MS * attempt;
      console.warn(`⚠️ OpenAI error. Retrying in ${wait}ms... (attempt ${attempt})`);
      await sleep(wait);
      return categorizeTags(tags, attempt + 1);
    }
    throw err;
  }
}

// --------------------
// Main
// --------------------
async function run() {
  console.log('🔍 Fetching already categorized tags...');

  const { data: categorizedData } = await supabase
    .from('image_tag_categories')
    .select('tag');

  const categorizedSet = new Set(categorizedData?.map(t => t.tag) || []);

  let offset = 0;
  let totalProcessed = 0;

  while (true) {
    console.log(`🔍 Fetching next batch of tags (offset ${offset})...`);

    // Fetch tags from working table
    const { data: rows, error } = await supabase
      .from('image_tag_working')
      .select('image_id, tag')
      .order('tag', { ascending: true })
      .range(offset, offset + 1000); // fetch more rows to extract unique tags

    if (error) {
      console.error('❌ Supabase fetch failed:', error);
      break;
    }

    if (!rows.length) {
      console.log('🎉 All tags processed!');
      break;
    }

    // Extract unique tags that have not been categorized yet
    const uniqueTags = [...new Set(rows.map(r => r.tag).filter(t => !categorizedSet.has(t)))].slice(0, BATCH_SIZE);

    if (!uniqueTags.length) {
      console.log('✅ No new unique tags in this batch, moving to next offset');
      offset += 1000;
      continue;
    }

    console.log(`📦 Categorizing ${uniqueTags.length} unique tags...`);

    let categories;
    try {
      categories = await categorizeTags(uniqueTags);
    } catch (err) {
      console.error('❌ Failed to categorize batch:', err.message);
      break;
    }

    // Insert categories for all images that have these tags
    for (const tag of uniqueTags) {
      const category = categories[tag];
      if (!category) continue;

      const imagesWithTag = rows.filter(r => r.tag === tag);

      for (const row of imagesWithTag) {
        const { error: insertError } = await supabase
          .from('image_tag_categories')
          .insert({
            image_id: row.image_id,
            tag: row.tag,
            category,
          });

        if (insertError) {
          console.error(`❌ Failed to insert category for image ${row.image_id}, tag "${row.tag}":`, insertError);
        } else {
          categorizedSet.add(row.tag);
          console.log(`✅ Image ${row.image_id} tag "${row.tag}" → "${category}"`);
        }
      }
      await sleep(RATE_LIMIT_MS);
    }

    totalProcessed += uniqueTags.length;
    console.log(`📊 Total unique tags processed so far: ${totalProcessed}`);
    offset += 1000;
  }

  console.log('🏁 Categorization complete!');
}

run();
