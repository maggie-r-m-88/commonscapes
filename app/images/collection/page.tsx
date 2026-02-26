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

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );

  const images: ImageData[] = data?.images || [];
  const total = data?.total || 0;

  if (!images.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No images in the collection yet.
      </div>
    );

  // Placeholder categories — replace with real API data later
  const placeholderCategories = [
    { name: "Landscapes", count: 312 },
    { name: "Geology", count: 98 },
    { name: "Architecture", count: 241 },
    { name: "Art & Culture", count: 175 },
    { name: "Wildlife", count: 203 },
    { name: "Water", count: 134 },
    { name: "Urban", count: 88 },
    { name: "Sky", count: 62 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">

      {/* Category cards — page 1 only */}
      {page === 1 && (
        <div className="mb-10">
          <h2 className="text-xl font-medium  mb-4">
            Browse by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {placeholderCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => router.push(`/categories/${cat.name.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`)}
                className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-200 group text-left"
              >
                {/* Placeholder bg — replace with real category image later */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-200 flex items-end p-3">
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">{cat.name}</p>
                    <p className="text-white/60 text-xs mt-0.5">{cat.count} images</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Browse header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium">
            {page === 1 ? "Browse all" : "Collection"}
          </h1>
{/*           {total > 0 && (
            <span className="text-sm text-gray-400">{total.toLocaleString()} images</span>
          )} */}
        </div>

        {/* Categories button — drawer hookup comes next */}
        <button
          onClick={() => {
            // TODO: open categories drawer
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-gray-200 text-sm bg-white hover:bg-gray-50 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 4h12M4 8h8M6 12h4"/>
          </svg>
          Categories
        </button>
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