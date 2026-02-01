import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

// Load your JSON
const imagesPath = path.join(process.cwd(), "images.json");
const imagesData = JSON.parse(fs.readFileSync(imagesPath, "utf-8"));

export async function GET(req: NextRequest) {
  const activeImages = imagesData.images.filter((img: any) => img.status === "active");

  if (activeImages.length === 0) {
    // No active images → fallback
    return NextResponse.json({
      url: "/wallpapers/fallback.jpg",
      status: "fallback"
    });
  }

  // --- Generate deterministic index based on date ---
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  // Simple hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash += dateStr.charCodeAt(i);
  }

  const index = hash % activeImages.length;
  const imageOfTheDay = activeImages[index];

  return NextResponse.json(imageOfTheDay);
}
