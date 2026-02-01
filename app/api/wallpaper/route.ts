import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    // Fetch all images from Supabase
    const { data: images, error } = await supabase
      .from('images')
      .select('*');

    if (error) {
      console.error("Supabase error:", error);
      return new Response(null, { status: 500 });
    }

    // Check if we have any images
    if (!images || images.length === 0) {
      return new Response(null, { status: 404 });
    }

    // Pick a random image
    const randomIndex = Math.floor(Math.random() * images.length);
    const randomImage = images[randomIndex];

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
