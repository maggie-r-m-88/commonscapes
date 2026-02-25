import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  try {
    const { category: rawCategory } = await context.params;
    const categoryName = decodeURIComponent(rawCategory);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "14", 10);

    // 1️⃣ Get category vector
    const { data: category, error: catError } = await supabase
      .from("image_categories")
      .select("vector")
      .ilike("name", categoryName)
      .single();

    if (catError || !category) {
      return NextResponse.json({ images: [], total: 0, page, pageSize });
    }

    // 2️⃣ Find closest images to category vector
    const { data: images, error: imageError } = await supabase.rpc(
  "get_closest_images",
  {
    category_vector: category.vector,
    similarity_threshold: 0.25, // tweak this
    limit_count: pageSize,
    offset_count: (page - 1) * pageSize,
  }
);

if (imageError) {
  return NextResponse.json(
    { error: "Failed to fetch images" },
    { status: 500 }
  );
}

const total = images?.[0]?.total_count || 0;

return NextResponse.json({
  images: images || [],
  page,
  pageSize,
  total,
});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}