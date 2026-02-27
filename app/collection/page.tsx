"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import Loader from "@/app/components/Loader";
import ImageGrid, { ImageData } from "@/app/components/ImageGrid";

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

  // 🔹 Collection query
  const { data, isLoading } = useQuery({
    queryKey: ["collection", page],
    queryFn: async () => {
      const res = await fetch(
        `/api/images/collection?page=${page}&pageSize=${pageSize}`
      );
      if (!res.ok) throw new Error("Failed to fetch collection");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  // 🔹 Categories query (parent categories only)
  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/images/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );

  const images: ImageData[] = data?.images || [];
  const total = data?.total || 0;
  const categories = categoryData?.categories || [];

  if (!images.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No images in the collection yet.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* Category cards — page 1 only */}
      {page === 1 && categories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-medium mb-4">
            Browse by category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() =>
                  router.push(
                    `/images/categories/${cat.slug}`
                  )
                }
                className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-200 group text-left"
              >
                {/* Real thumbnail */}
                <img
                  src={cat.thumbnail_url}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-200 flex items-end p-3">
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">
                      {cat.name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Browse header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-medium">
          {page === 1 ? "Browse all" : "Collection"}
        </h1>
      </div>

      <ImageGrid
        images={images}
        total={total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}