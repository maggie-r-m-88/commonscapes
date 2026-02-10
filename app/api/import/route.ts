import { NextResponse } from "next/server";
import { fetchImageInfo, extractMetadata } from "@/lib/wikimedia";
import { generateTags } from "@/lib/openai-tags";
import { generateEmbedding } from "@/lib/openai-embed";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    console.log("📥 /api/import called");

    const { filename } = await req.json();
    console.log("📨 Received filename:", filename);

    if (!filename) {
      console.warn("⚠️ Missing filename in request");
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }


    // 1️⃣ Fetch Wikimedia metadata
    console.log("🌐 Fetching Wikimedia metadata...");
    const imageinfo = await fetchImageInfo(filename);
    if (!imageinfo) {
      console.warn("⚠️ No imageinfo returned from Wikimedia");
      return NextResponse.json({ error: 'No imageinfo found' }, { status: 404 });
    }
    console.log("✅ Wikimedia metadata fetched");

    const meta = extractMetadata(filename, imageinfo);
    console.log("🗂 Extracted metadata:", meta);

    // Check if the image already exists
    console.log("🔎 Checking if image already exists in Supabase...");
    const { data: existingImages, error: checkError } = await supabase
      .from('images')
      .select('id')
      .eq('url', meta.url)
      .limit(1);

    if (checkError) {
      console.error("❌ Supabase check failed:", checkError);
      return NextResponse.json({ error: 'DB check failed' }, { status: 500 });
    }

    if (existingImages?.length) {
      console.log(`ℹ️ Image already exists (id: ${existingImages[0].id}), skipping import.`);
      return NextResponse.json({ ok: true, skipped: true, id: existingImages[0].id });
    }

    // 2️⃣ Upsert metadata if it doesn’t exist
    console.log("📤 Upserting metadata to Supabase...");
    const { data: upsertedRows, error: upsertError } = await supabase
      .from('images')
      .upsert(meta, { onConflict: 'url', ignoreDuplicates: false })
      .select('id');

    if (upsertError) {
      console.error("❌ Supabase upsert failed:", upsertError);
      return NextResponse.json({ error: 'DB upsert failed' }, { status: 500 });
    }

    const imageId = upsertedRows?.[0]?.id;
    console.log(`✅ Metadata upserted, image ID: ${imageId}`);

    // 3️⃣ Generate tags from OpenAI
    console.log("🏷 Generating tags with OpenAI...");
    const tags = await generateTags(meta);
    console.log(`✅ Tags generated (${tags.length}):`, tags);

    const { error: tagError } = await supabase
      .from('image_tag_candidates')
      .insert({ image_id: imageId, image_url: meta.url, tags, model: 'gpt-4.1-mini', prompt_version: 'v1' });

    if (tagError) console.warn("⚠️ Failed to insert tags into Supabase", tagError);
    else console.log("✅ Tags inserted into Supabase");


    // 4️⃣ Combine metadata + tags and create embedding
    console.log("🧠 Generating embedding for image...");
    const embeddingText = `${meta.title} ${meta.description} ${meta.categories.join(' ')} ${tags.join(' ')}`;
    const vector = await generateEmbedding(embeddingText);
    console.log(`✅ Embedding generated, length: ${vector.length}`);

    // 5️⃣ Save embedding in images table
    console.log("💾 Saving embedding to Supabase...");
    const { error: vectorError } = await supabase
      .from('images')
      .update({ vector })
      .eq('url', meta.url);

    if (vectorError) console.warn("⚠️ Failed to save vector in Supabase", vectorError);
    else console.log("✅ Embedding saved in Supabase");

    console.log("🎉 /api/import finished successfully");
    return NextResponse.json({ ok: true, meta, tags, vectorLength: vector.length });

  } catch (err) {
    console.error("🔥 Pipeline error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
