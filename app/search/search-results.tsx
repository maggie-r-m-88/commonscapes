"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Loader from "@/app/components/Loader";
import ImageGrid, { ImageData } from "@/app/components/ImageGrid";

export default function SearchResults() {
  const searchParams = useSearchParams();

  const query = searchParams.get("q");
  const decodedQuery = decodeURIComponent(query || "");
  const type = searchParams.get("type") || "images";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, type, page],
    queryFn: async () => {
      if (!query) return { images: [], total: 0, page, pageSize };

      const res = await fetch("/api/images/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page, pageSize }),
      });

      return res.json();
    },
    enabled: !!query,
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
        No results found for "{decodedQuery || ""}"
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Results for "{decodedQuery}"
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