import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "12", 10);
    const offset = (page - 1) * pageSize;

    // 1️⃣ Fetch images from the collection, featured first
    const { data: images, error } = await supabase
      .from("images")
      .select("id, url, title, description, owner, featured")
      .order("featured", { ascending: false })
      .order("added_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json(
        { images: [], total: 0, page, pageSize },
        { status: 500 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ images: [], total: 0, page, pageSize });
    }

    // 2️⃣ Get total count
    const { count: total } = await supabase
      .from("images")
      .select("id", { count: "exact", head: true });

    // 3️⃣ 🔄 Transform Wikimedia URLs only
    const transformedImages = images.map((img: any) => {
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

    return NextResponse.json(
      {
        images: transformedImages,
        total: total || 0,
        page,
        pageSize,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json({ images: [], total: 0, page: 1, pageSize: 12 }, { status: 500 });
  }
}