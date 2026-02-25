"use server";

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: image, error: imageError } = await supabase
      .from("images")
      .select("vector")
      .eq("id", parseInt(id))
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const { data: taxonomy, error: taxError } = await supabase.rpc(
      "get_closest_categories",
      {
        image_vector: image.vector,
        limit_count: 2,
      }
    );

    if (taxError) console.warn("Failed to fetch categories:", taxError);

    return NextResponse.json(taxonomy || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch taxonomy" }, { status: 500 });
  }
}