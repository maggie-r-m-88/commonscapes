// app/api/search/route.js
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { query } = await req.json();

    console.log('🔹 Received query:', query);

    if (!query) {
      console.log('⚠️ Empty query, returning empty array');
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // 1️⃣ Generate embedding from OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-large', // 3072-d vector
      input: query
    });

    const queryVector = embeddingResponse.data[0].embedding;

    console.log('🔹 Query vector length:', queryVector.length);
    console.log('🔹 First 10 values of vector:', queryVector.slice(0, 10));

    // 2️⃣ Call Supabase RPC function to get nearest images
    const { data, error } = await supabase.rpc('match_images', {
      query: queryVector
    });

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    console.log(`✅ Found ${data.length} results`);

    return new Response(JSON.stringify(data || []), { status: 200 });

  } catch (err) {
    console.error('❌ Server error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
