"use server";

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

function getOptimizedWikimediaUrl(url: string): string {
  if (url.includes("/wikipedia/commons/thumb/") && /\/1280px-/.test(url)) return url;

  const m = url.match(/wikipedia\/commons\/([^\/]+)\/([^\/]+)\/(.+)$/i);
  if (m) {
    const [, first, second, filenameWithExt] = m;
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
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...image,
      url: getOptimizedWikimediaUrl(image.url),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}