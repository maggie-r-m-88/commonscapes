import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentSlug = searchParams.get("parent");

    // 🔹 Top-level categories
    if (!parentSlug) {
      const { data, error } = await supabase
        .from("image_categories")
        .select("id, name, slug, thumbnail_url")
        .is("parent_id", null)
        .order("name", { ascending: true });

      if (error) throw error;

      return NextResponse.json({ categories: data ?? [] });
    }

    // 🔹 Find parent by slug
    const { data: parent, error: parentError } = await supabase
      .from("image_categories")
      .select("id")
      .eq("slug", parentSlug)
      .single();

    if (parentError || !parent) {
      return NextResponse.json({ categories: [] }, { status: 404 });
    }

    // 🔹 Fetch children
    const { data: children, error: childError } = await supabase
      .from("image_categories")
      .select("id, name, slug, thumbnail_url")
      .eq("parent_id", parent.id)
      .order("name", { ascending: true });

    if (childError) throw childError;

    return NextResponse.json({ categories: children ?? [] });

  } catch (err) {
    console.error("❌ Categories API error:", err);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}