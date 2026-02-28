"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import Loader from "@/app/components/Loader";
import ImageGrid, { ImageData } from "@/app/components/ImageGrid";

export default function TagPage() {
  const params = useParams();
  const tag = params.tag as string;
  const decodedTag = decodeURIComponent(tag);
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["tag", tag, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/images/tags/${encodeURIComponent(tag)}?page=${page}&pageSize=${pageSize}`
      );
      return res.json();
    },
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
    <div className="w-full bg-pattern">
      <div className="max-w-7xl xl:max-w-5xl  mx-auto p-8">
        <h1 className="text-xl font-semibold mb-6">Images tagged "{decodedTag}"</h1>

        <ImageGrid
          images={images}
          total={total}
          page={page}
          pageSize={pageSize}

        />
      </div>
    </div>

  );
}