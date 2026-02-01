import { promises as fs } from "fs";
import path from "path";

interface ImageEntry {
  url: string;
  status: "active" | "inactive";
  addedAt?: string;
  source?: string;
  notes?: string;
}

export async function GET() {
  // Path to your JSON file
  const jsonPath = path.join(process.cwd(), "data", "images.json");
  
  // Read and parse JSON
  const data = await fs.readFile(jsonPath, "utf-8");
  const images: ImageEntry[] = JSON.parse(data).images;

  // Filter active images
  const activeImages = images.filter(img => img.status === "active");
  if (activeImages.length === 0) {
    return new Response(null, { status: 404 });
  }

  // Pick a random image
  const randomIndex = Math.floor(Math.random() * activeImages.length);
  const image = activeImages[randomIndex].url;

  // Redirect to the image URL
  return new Response(null, {
    status: 302,
    headers: {
      Location: image,
      "Cache-Control": "no-store",
    },
  });
}
