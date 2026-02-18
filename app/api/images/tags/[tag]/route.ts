import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ tag: string }> }
) {
  try {
    // ✅ NEW: await params
    const { tag: rawTag } = await context.params;

    if (!rawTag) {
      return NextResponse.json(
        { error: "Tag parameter is required" },
        { status: 400 }
      );
    }

    const tag = decodeURIComponent(rawTag);
    console.log("Fetching images for tag:", tag);

    // 1️⃣ Fetch image IDs
    const { data: imageTags, error: tagError } = await supabase
      .from("image_tag_working")
      .select("image_id")
      .ilike("tag", tag);

    if (tagError) {
      console.error(tagError);
      return NextResponse.json(
        { error: "Failed to fetch tags" },
        { status: 500 }
      );
    }

    if (!imageTags || imageTags.length === 0) {
      return NextResponse.json({ images: [] });
    }

    const imageIds = imageTags.map((t) => t.image_id);

    // 2️⃣ Fetch images
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("*")
      .in("id", imageIds);

    if (imagesError) {
      console.error(imagesError);
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    return NextResponse.json({ images: images ?? [] });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
