import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Convert Wikimedia full-res URL to 1280px thumbnail
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: image, error } = await supabase
      .from("images")
      .select("*")
      .eq("id", parseInt(id))
      .single();

    if (error || !image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Optimize the image URL to 1280px thumbnail
    const optimizedImage = {
      ...image,
      url: getOptimizedWikimediaUrl(image.url),
    };

    return NextResponse.json(optimizedImage);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
