import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getOptimizedWikimediaUrl(url: string): string {
  // If it's already a thumb URL with a size, return it unchanged
  if (url.includes('/wikipedia/commons/thumb/') && /\/1280px-/.test(url)) {
    return url;
  }

  // Match a full-res commons path like:
  // https://upload.wikimedia.org/wikipedia/commons/f/f0/Filename.JPG
  const m = url.match(/wikipedia\/commons\/([^\/]+)\/([^\/]+)\/(.+)$/i);
  if (m) {
    const [, first, second, filenameWithExt] = m;
    // Build thumbnail URL: .../thumb/<first>/<second>/<filename.ext>/1280px-<filename.ext>
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${first}/${second}/${filenameWithExt}/1280px-${filenameWithExt}`;
  }

  return url;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    if (!tag) {
      return NextResponse.json({ error: "Tag parameter is required" }, { status: 400 });
    }

    // 1️⃣ Find all image IDs for this tag
    const { data: imageTags, error: tagError } = await supabase
      .from("image_tag_working")
      .select("image_id")
      .ilike("tag", tag) // case-insensitive match
      .order("id", { ascending: true });

    if (tagError) {
      console.error(tagError);
      return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }

    if (!imageTags || imageTags.length === 0) {
      return NextResponse.json({ images: [] }); // no images found
    }

    const imageIds = imageTags.map((t) => t.image_id);

    // 2️⃣ Fetch the images themselves
    const { data: images, error: imagesError } = await supabase
      .from("images")
      .select("*")
      .in("id", imageIds);

    if (imagesError) {
      console.error(imagesError);
      return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }

    // 3️⃣ Optionally optimize URLs
    const result = images?.map((img) => ({
      ...img,
      url: getOptimizedWikimediaUrl(img.url),
    }));

    return NextResponse.json({ images: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
