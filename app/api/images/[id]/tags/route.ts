"use server";

import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: tags, error } = await supabase
      .from("image_tag_working")
      .select("id, tag, source")
      .eq("image_id", parseInt(id))
      .order("tag", { ascending: true });

    if (error) console.warn("Failed to fetch tags", error);

    return NextResponse.json(tags || []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}