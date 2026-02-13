import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* --------------------------------------------------
   GET - Fetch single image by ID or slug
--------------------------------------------------- */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug"); // slugified title

    if (!id && !slug) {
      return NextResponse.json(
        { error: "Provide either `id` or `slug`" },
        { status: 400 }
      );
    }

    // Build the query
    let query = supabase.from("images").select("*").limit(1);

    if (id) {
      query = query.eq("id", id);
    } else if (slug) {
      // Assuming your slug is stored in a "slug" column, or generate from title
      query = query.eq("slug", slug);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
