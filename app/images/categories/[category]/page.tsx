"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams, useRouter } from "next/navigation";

import Loader from "@/app/components/Loader";
import ImageGrid, { ImageData } from "@/app/components/ImageGrid";

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnail_url?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const decodedCategory = decodeURIComponent(category);

  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

  const router = useRouter(); // ✅ Add this line

  // Fetch category images
  const { data, isLoading } = useQuery({
    queryKey: ["category", category, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/images/categories/${encodeURIComponent(
          category
        )}?page=${page}&pageSize=${pageSize}`
      );
      if (!res.ok) throw new Error("Failed to fetch category images");
      return res.json();
    },
    enabled: !!category,
    placeholderData: (prev) => prev,
  });

  // Fetch subcategories only on page 1
  const { data: subcategories } = useQuery({
    queryKey: ["subcategories", category],
    queryFn: async () => {
      const res = await fetch(
        `/api/images/categories?parent=${encodeURIComponent(category)}`
      );
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      return res.json();
    },
    enabled: !!category && page === 1,
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );

  const images: ImageData[] = data?.images || [];
  const total = data?.total || 0;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6 capitalize">{decodedCategory}</h1>

      {/* Render subcategories on first page */}
      {page === 1 && subcategories?.categories?.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-medium mb-4">Subcategories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {subcategories.categories.map((sub: Subcategory) => (
              <button
                key={sub.id}
                onClick={() => router.push(`/images/categories/${sub.slug}`)}
                className="relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-200 group text-left"
              >
                {/* Thumbnail */}
                {sub.thumbnail_url ? (
                  <img
                    src={sub.thumbnail_url}
                    alt={sub.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200" />
                )}

                {/* Overlay with name */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-200 flex items-end p-3">
                  <p className="text-white text-sm font-medium leading-tight">
                    {sub.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {images.length > 0 ? (
        <ImageGrid images={images} total={total} page={page} pageSize={pageSize} />
      ) : (
        <div className="min-h-[200px] flex items-center justify-center">
          No images found for category "{decodedCategory}"
        </div>
      )}
    </div>
  );
}