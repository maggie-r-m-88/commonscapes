import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  try {
    // 🔹 Unwrap async params (Next.js requirement)
    const { category } = await context.params;
    const slug = decodeURIComponent(category);

    // 🔹 Pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "14", 10), 1),
      50 // hard cap for safety
    );

    // 🔹 Fetch category by slug
    const { data: categoryData, error: categoryError } = await supabase
      .from("image_categories")
      .select("id, name, slug, vector")
      .eq("slug", slug)
      .single();

    if (categoryError || !categoryData) {
      return NextResponse.json(
        { category: null, images: [], total: 0, page, pageSize },
        { status: 404 }
      );
    }

    // 🔹 Call vector similarity RPC
    const { data: images, error: imageError } = await supabase.rpc(
      "get_closest_images",
      {
        category_vector: categoryData.vector,
        similarity_threshold: 0.19,
        limit_count: pageSize,
        offset_count: (page - 1) * pageSize,
      }
    );

    if (imageError) {
      console.error("Image RPC error:", imageError);
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: 500 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json({
        category: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
        },
        images: [],
        total: 0,
        page,
        pageSize,
      });
    }

    const total = images[0]?.total_count ?? 0;

    // 🔹 Wikimedia thumbnail transform
    const transformedImages = images.map((img: any) => {
      let transformedUrl = img.url;

      if (img.url?.includes("upload.wikimedia.org")) {
        const match = img.url.match(
          /\/wikipedia\/commons\/([a-z0-9])\/([a-z0-9]{2})\/(.+)$/i
        );

        if (match) {
          const [, first, firstTwo, filename] = match;
          transformedUrl =
            `https://upload.wikimedia.org/wikipedia/commons/thumb/${first}/${firstTwo}/${filename}/1280px-${filename}`;
        }
      }

      return {
        ...img,
        url: transformedUrl,
      };
    });

    return NextResponse.json(
      {
        category: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
        },
        images: transformedImages,
        total,
        page,
        pageSize,
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}