import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/* --------------------------------------------------
   GET - List images (server-side pagination + filter)
--------------------------------------------------- */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const featured = searchParams.get("featured");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Only select fields needed for the admin list view to reduce egress
    let query = supabase
      .from("images")
      .select("id, url, title, added_at, source, attribution, width, height", { count: "exact" })
      .order("added_at", { ascending: false })
      .range(from, to);

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    const { data: images, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to read images" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        images: images || [],
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
}

/* --------------------------------------------------
   POST - Add new image
--------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newImage = {
      url: body.url,
      title: body.title || null,
      added_at: new Date().toISOString(),
      source: body.source || null,
      attribution: body.attribution || null,
      width: body.width || null,
      height: body.height || null,
      mime: body.mime || null,
      license_name: body.license_name || null,
      license_url: body.license_url || null,
      categories: body.categories || null,
      description: body.description || null,
      taken_at: body.taken_at || null,
      featured: body.featured ?? false, // 👈 default
    };

    const { data, error } = await supabase
      .from("images")
      .insert([newImage])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to add image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, image: data });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}

/* --------------------------------------------------
   PUT - Update image (supports featured toggle)
--------------------------------------------------- */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...imageData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("images")
      .update(imageData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update image" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, image: data });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

/* --------------------------------------------------
   DELETE - Remove image by URL
--------------------------------------------------- */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("images")
      .delete()
      .eq("url", url)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: data });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
