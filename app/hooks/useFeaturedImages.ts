import { useQuery } from "@tanstack/react-query";

interface ImageData {
  id: string | number;
  url: string;
  description?: string;
  title?: string;
  artist?: string;
  date?: string;
  source?: string;
  license_name?: string;
  license_url?: string;
  width?: number;
  height?: number;
  mime?: string;
  owner?: string;
  categories?: string[];
}

interface FeaturedImagesResponse {
  hero: ImageData | null;
  images: ImageData[];
}

export function useFeaturedImages(limit = 5, heroSize = 2000, gridSize = 1280) {
  return useQuery<FeaturedImagesResponse>({
    queryKey: ["featuredImages", { limit, heroSize, gridSize }],
    queryFn: async () => {
      const res = await fetch(
        `/api/featured/home?limit=${limit}&heroSize=${heroSize}&gridSize=${gridSize}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch featured images");
      }
      return res.json();
    },
  });
}
