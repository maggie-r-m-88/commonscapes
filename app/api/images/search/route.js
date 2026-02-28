// app/api/images/search/route.js

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { query, page = 1, pageSize = 14 } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ images: [], total: 0, page, pageSize }),
        { status: 200 }
      );
    }

    // 1️⃣ Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: query,
    });

    const queryVector = embeddingResponse.data[0].embedding;

    // 2️⃣ Call paginated RPC
    const { data, error } = await supabase.rpc("match_images", {
      query: queryVector,
      limit_count: pageSize,
      offset_count: (page - 1) * pageSize,
    });

    if (error) {
      console.error("❌ Supabase RPC error:", error);
      return new Response(
        JSON.stringify({ error: "Search failed" }),
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ images: [], total: 0, page, pageSize }),
        { status: 200 }
      );
    }

    const total = data[0]?.total_count || 0;
    const distances = data.map(img => img.distance).sort((a, b) => a - b);

    console.log(`🔍 Search results: ${data.length} images, total: ${total}, page: ${page}`);
    console.log(`📊 Distance range: min=${distances[0]?.toFixed(3)}, max=${distances[distances.length-1]?.toFixed(3)}`);

    // 🔄 Transform Wikimedia URLs
    const transformedImages = data.map((img) => {
      let transformedUrl = img.url;

      if (img.url?.includes("upload.wikimedia.org")) {
        const match = img.url.match(
          /\/wikipedia\/commons\/([a-z0-9])\/([a-z0-9]{2})\/(.+)$/i
        );

        if (match) {
          const [, first, firstTwo, filename] = match;
          transformedUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/${first}/${firstTwo}/${filename}/1280px-${filename}`;
        }
      }

      return {
        ...img,
        url: transformedUrl,
      };
    });

    return new Response(
      JSON.stringify({
        images: transformedImages,
        page,
        pageSize,
        total,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Server error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}