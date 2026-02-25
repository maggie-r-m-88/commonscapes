import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Reuse your Wikimedia optimizer if needed
function getOptimizedWikimediaUrl(url: string): string {
  if (url.includes("/wikipedia/commons/thumb/") && /\/1280px-/.test(url)) {
    return url;
  }

  const m = url.match(/wikipedia\/commons\/([^\/]+)\/([^\/]+)\/(.+)$/i);
  if (m) {
    const [, first, second, filename] = m;
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${first}/${second}/${filename}/1280px-${filename}`;
  }

  return url;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const imageId = parseInt(id, 10);

  try {
    // 1️⃣ Get vector of current image
    const { data: image, error } = await supabase
      .from("images")
      .select("vector")
      .eq("id", imageId)
      .single();

    if (error || !image?.vector) {
      return NextResponse.json(
        { error: "Image or vector not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Perform similarity search using pgvector
    // <-> = cosine distance (if vector type configured as cosine)
    const { data: related, error: relatedError } = await supabase
      .rpc("match_similar_images", {
        query_vector: image.vector,
        image_id: imageId,
        match_count: 6,
      });

    if (relatedError) {
      console.error(relatedError);
      return NextResponse.json(
        { error: "Similarity search failed" },
        { status: 500 }
      );
    }

    const optimized = (related || []).map((img: any) => ({
      ...img,
      url: getOptimizedWikimediaUrl(img.url),
    }));

    return NextResponse.json(optimized);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch related images" },
      { status: 500 }
    );
  }
}