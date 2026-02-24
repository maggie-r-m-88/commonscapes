"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { useParams } from "next/navigation";

interface ImageData {
  id: string | number;
  url: string;
  description?: string;
  owner?: string;
  source?: string;
  title?: string;
  // include tags if available
  tags?: any[];
}

export default function TagPage() {
  const params = useParams();
  const tag = params.tag as string;
  const queryClient = useQueryClient();

  // Fetch tag images
  const { data, isLoading } = useQuery({
    queryKey: ["tag", tag],
    queryFn: async () => {
      const res = await fetch(`/api/images/tags/${encodeURIComponent(tag)}`);
      return res.json();
    },
    enabled: !!tag,
    staleTime: 1000 * 60 * 5, // 5 min cache
    onSuccess: (data) => {
      if (!data?.images) return;

      // ✅ Seed each image as a full React Query entry
      data.images.forEach((img: ImageData) => {
        queryClient.setQueryData(
          ["image", String(img.id)],
          {
            ...img,
            id: String(img.id),
            // Mark as fresh for 5 mins to prevent refetch
          },
          { staleTime: 1000 * 60 * 5 }
        );
      });
    },
  });

  const images: ImageData[] = data?.images || [];

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading images for "{tag}"...
      </div>
    );

  if (!images.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No images found for "{tag}"
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Images tagged: "{tag}"
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
        {images.map((img, index) => {
          const isLarge = index % 7 === 0;
          const isRightSide = Math.floor(index / 7) % 2 === 1;

          return (
            <Link
              key={img.id}
              href={`/images/${img.id}`}
              className={
                isLarge
                  ? `md:col-span-2 md:row-span-2 ${
                      isRightSide ? "md:col-start-2" : ""
                    }`
                  : ""
              }
            >
              <div className="relative w-full h-full bg-gray-100 rounded shadow group overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.description || ""}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                  style={{
                    viewTransitionName: `image-${img.id}`,
                    willChange: "transform",
                  }}
                />

                <div className="absolute inset-0 bg-black/60 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white">
                    <p className="text-sm font-medium line-clamp-1">
                      {img.description}
                    </p>
                    <p className="text-xs text-gray-200 line-clamp-1">
                      {img.owner}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
