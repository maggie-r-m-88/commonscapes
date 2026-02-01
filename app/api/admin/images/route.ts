import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const IMAGES_PATH = path.join(process.cwd(), "data", "images.json");

interface Image {
  url: string;
  status: string;
  addedAt: string;
  source: string;
  notes: string;
}

interface ImagesData {
  images: Image[];
}

async function readImages(): Promise<ImagesData> {
  const data = await fs.readFile(IMAGES_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeImages(data: ImagesData): Promise<void> {
  await fs.writeFile(IMAGES_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET - List all images
export async function GET() {
  try {
    const data = await readImages();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read images" },
      { status: 500 }
    );
  }
}

// POST - Add new image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await readImages();
    
    const newImage: Image = {
      url: body.url,
      status: body.status || "active",
      addedAt: new Date().toISOString(),
      source: body.source || "",
      notes: body.notes || "",
    };
    
    data.images.push(newImage);
    await writeImages(data);
    
    return NextResponse.json({ success: true, image: newImage });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}

// PUT - Update image
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { index, ...imageData } = body;
    
    const data = await readImages();
    
    if (index < 0 || index >= data.images.length) {
      return NextResponse.json(
        { error: "Invalid index" },
        { status: 400 }
      );
    }
    
    data.images[index] = {
      ...data.images[index],
      ...imageData,
    };
    
    await writeImages(data);
    
    return NextResponse.json({ success: true, image: data.images[index] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

// DELETE - Remove image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const index = parseInt(searchParams.get("index") || "");
    
    if (isNaN(index)) {
      return NextResponse.json(
        { error: "Invalid index" },
        { status: 400 }
      );
    }
    
    const data = await readImages();
    
    if (index < 0 || index >= data.images.length) {
      return NextResponse.json(
        { error: "Invalid index" },
        { status: 400 }
      );
    }
    
    const deleted = data.images.splice(index, 1);
    await writeImages(data);
    
    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

