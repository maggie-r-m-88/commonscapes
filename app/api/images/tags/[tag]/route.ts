import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag: rawTag } = await context.params;
    if (!rawTag) {
      return NextResponse.json({ error: "Tag parameter is required" }, { status: 400 });
    }

    const tag = decodeURIComponent(rawTag);

    // 1️⃣ Fetch image IDs
    const { data: imageTags, error: tagError } = await supabase
      .from("image_tag_working")
      .select("image_id")
      .ilike("tag", tag);

    if (tagError) {
      console.error(tagError);
      return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }

    if (!imageTags || imageTags.length === 0) {
      return NextResponse.json({ images: [] });
    }

    const imageIds = imageTags.map(t => t.image_id);

    // 2️⃣ Fetch images
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("*")
      .in("id", imageIds);

    if (imagesError) {
      console.error(imagesError);
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }

    // 3️⃣ Fetch tags for each image
    const imagesWithTags = await Promise.all(
      (images || []).map(async (img: any) => {
        const { data: tags } = await supabase
          .from("image_tag_working")
          .select("id, tag, source")
          .eq("image_id", img.id);

        // 4️⃣ Transform Wikimedia URL to 1200px thumbnail
        let transformedUrl = img.url;
        if (img.url?.includes("upload.wikimedia.org")) {
          const match = img.url.match(/\/wikipedia\/commons\/([a-z0-9])\/([a-z0-9]{2})\/(.+)$/i);
          if (match) {
            const [, first, firstTwo, filename] = match;
            transformedUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/${first}/${firstTwo}/${filename}/1280px-${filename}`;
          }
        }

        return {
          ...img,
          url: transformedUrl,
          tags: tags || [],
        };
      })
    );

    return NextResponse.json(
      { images: imagesWithTags },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
