import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    // Get total count first
    const { count, error: countError } = await supabase
      .from('images')
      .select('*', { count: 'exact', head: true });

    if (countError || !count || count === 0) {
      console.error("Supabase error:", countError);
      return new Response(null, { status: 404 });
    }

    // Pick a random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Fetch only ONE random image
    const selectFields = format === "json"
      ? '*'  // Full data if JSON requested
      : 'url';  // Only URL for redirect

    const { data: images, error } = await supabase
      .from('images')
      .select(selectFields)
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error || !images || images.length === 0) {
      console.error("Supabase error:", error);
      return new Response(null, { status: 500 });
    }

    const randomImage = images[0];

    // If format=json, return the full image data
    if (format === "json") {
      return Response.json(randomImage, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    // Otherwise, redirect to the image URL
    return new Response(null, {
      status: 302,
      headers: {
        Location: randomImage.url,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(null, { status: 500 });
  }
}
