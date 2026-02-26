import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20", 10);
    const offset = (page - 1) * pageSize;

    // 1️⃣ Get top-level categories
    const { data: categories, error: catError } = await supabase
      .from("image_categories")
      .select("id, name, vector")
      .is("parent_id", null)
      .range(offset, offset + pageSize - 1)
      .order("name", { ascending: true });

    if (catError || !categories || categories.length === 0) {
      return NextResponse.json({ categories: [], total: 0, page, pageSize });
    }

    // 2️⃣ For each category, get the closest featured image using RPC
    const categoriesWithThumbnail = await Promise.all(
      categories.map(async (cat: any) => {
        const { data: images, error: imageError } = await supabase.rpc(
          "get_closest_images",
          {
            category_vector: cat.vector,
            similarity_threshold: 0.0,
            limit_count: 1,
            offset_count: 0,
            filter_featured: true, // <--- only featured images
          }
        );

        let thumbnailUrl: string | null = null;

        if (images && images.length > 0) {
          let url = images[0].url;

          // 🔄 Transform Wikimedia URLs
          if (url?.includes("upload.wikimedia.org")) {
            const match = url.match(
              /\/wikipedia\/commons\/([a-z0-9])\/([a-z0-9]{2})\/(.+)$/i
            );
            if (match) {
              const [, first, firstTwo, filename] = match;
              url = `https://upload.wikimedia.org/wikipedia/commons/thumb/${first}/${firstTwo}/${filename}/1280px-${filename}`;
            }
          }

          thumbnailUrl = url;
        }

        return {
          id: cat.id,
          name: cat.name,
          thumbnail: thumbnailUrl,
        };
      })
    );

    // 3️⃣ Total top-level categories count
    const { count: total } = await supabase
      .from("image_categories")
      .select("id", { count: "exact", head: true })
      .is("parent_id", null);

    return NextResponse.json(
      {
        categories: categoriesWithThumbnail,
        page,
        pageSize,
        total: total || 0,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { categories: [], total: 0, page: 1, pageSize: 20 },
      { status: 500 }
    );
  }
}