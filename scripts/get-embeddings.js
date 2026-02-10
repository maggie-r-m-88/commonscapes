import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// --------------------
// Config
// --------------------
const RATE_LIMIT_MS = 1500; // ms between OpenAI calls
const BATCH_SIZE = 50;
const MAX_RETRIES = 5;

// --------------------
// Supabase client
// --------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// --------------------
// OpenAI client
// --------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --------------------
// Helper to sleep
// --------------------
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --------------------
// Generate embedding
// --------------------
async function generateEmbedding(text, attempt = 1) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large', // 1536 dimensions
      input: text
    });
    return response.data[0].embedding;
  } catch (err) {
    if (attempt <= MAX_RETRIES) {
      const wait = RATE_LIMIT_MS * attempt;
      console.warn(`⚠️ OpenAI error, retrying in ${wait / 1000}s (attempt ${attempt})`);
      await sleep(wait);
      return generateEmbedding(text, attempt + 1);
    }
    throw err;
  }
}

// --------------------
// Main batch process
// --------------------
async function run() {
  console.log('🔍 Starting canonical text embedding process...');

  let failedImages = [];

  while (true) {
    // Fetch canonical text
    const { data: images, error } = await supabase
      .from('image_with_canonical_text')
      .select('image_id, canonical_text')
      .limit(BATCH_SIZE);

    if (error) {
      console.error('❌ Supabase fetch failed:', error);
      break;
    }

    if (!images || !images.length) {
      console.log('🎉 No more images to process. Done!');
      break;
    }

    console.log(`📦 Processing batch of ${images.length} images...`);

    for (const image of images) {
      try {
        console.log(`🧠 Generating vector for image_id ${image.image_id}`);
        const vector = await generateEmbedding(image.canonical_text);

// Ensure numbers, just in case
const numericVector = vector.map(Number);

const { error: updateError } = await supabase
  .from('images')
  .update({ vector: numericVector })
  .eq('id', image.image_id);

if (updateError) {
  console.error(`❌ Failed to update vector for image_id ${image.image_id}`, updateError);
} else {
  console.log(`✅ Vector saved for image_id ${image.image_id}`);
}

        await sleep(RATE_LIMIT_MS);

      } catch (err) {
        console.error(`❌ Failed image_id ${image.image_id}`, err.message);
        failedImages.push({ id: image.image_id, reason: 'openai', error: err.message });
      }
    }
  }

  if (failedImages.length) {
    console.log('🚨 Summary of failed images:');
    console.table(failedImages);
  }
}

run();
