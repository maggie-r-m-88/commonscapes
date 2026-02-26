"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import Loader from "@/app/components/Loader";
import ImageGrid, { ImageData } from "@/app/components/ImageGrid";

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const decodedCategory = decodeURIComponent(category);

  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["category", category, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/images/categories/${encodeURIComponent(
          category
        )}?page=${page}&pageSize=${pageSize}`
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
        <Loader />
      </div>
    );

  const images: ImageData[] = data?.images || [];
  const total = data?.total || 0;

  if (!images.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No images found for category "{decodedCategory}"
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">
        {decodedCategory}
      </h1>

      <ImageGrid
        images={images}
        total={total}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}