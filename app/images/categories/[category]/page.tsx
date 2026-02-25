"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { useParams, useSearchParams, useRouter } from "next/navigation";

interface ImageData {
  id: string | number;
  url: string;
  description?: string;
  owner?: string;
  source?: string;
  title?: string;
  tags?: any[];
}

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const pageSize = 12; // must match API

  const { data, isLoading } = useQuery({
    queryKey: ["category", category, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/images/categories/${encodeURIComponent(category)}?page=${page}&pageSize=${pageSize}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch category images");
      }

      return res.json();
    },
    placeholderData: (prev) => prev,
    enabled: !!category,
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading images for category "{category}"...
      </div>
    );

  const images: ImageData[] = data?.images || [];
  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  if (!images.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No images found for category "{category}"
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Images in category: "{category}"
      </h1>

      {/* Custom masonry grid */}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() =>
                router.push(
                  `/images/categories/${category}?page=${i + 1}`
                )
              }
              className={`px-3 py-1 rounded ${
                i + 1 === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}