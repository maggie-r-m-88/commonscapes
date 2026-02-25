import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// --------------------
// Config
// --------------------
const RATE_LIMIT_MS = 1000; // ms between API calls to avoid rate limits
const BATCH_SIZE = 10;      // how many categories to process per batch

// --------------------
// Supabase
// --------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// --------------------
// OpenAI
// --------------------
const OPENAI_URL = 'https://api.openai.com/v1/embeddings';
const OPENAI_MODEL = 'text-embedding-3-large';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// --------------------
// Generate embedding for a text
// --------------------
async function generateEmbedding(text) {
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: text
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI embedding error: ${res.status} ${body}`);
  }

  const json = await res.json();
  return json.data[0].embedding;
}

// --------------------
// Main
// --------------------
async function run() {
  // fetch categories without vectors
  const { data: categories, error } = await supabase
    .from('image_categories')
    .select('id, name, description')
    .is('vector', null);

  if (error) {
    console.error('Error fetching categories:', error);
    return;
  }

  console.log(`Found ${categories.length} categories to embed`);

  for (const category of categories) {
    try {
      console.log(`Generating vector for: ${category.name}`);

      const vector = await generateEmbedding(category.description);

      // update table
      const { error: updateError } = await supabase
        .from('image_categories')
        .update({ vector })
        .eq('id', category.id);

      if (updateError) {
        console.error(`Failed to update category ${category.name}:`, updateError);
      } else {
        console.log(`✅ Vector saved for ${category.name}`);
      }

      await sleep(RATE_LIMIT_MS); // avoid rate limits

    } catch (err) {
      console.error(`❌ Error generating vector for ${category.name}:`, err.message);
    }
  }

  console.log('All done!');
}

run();
