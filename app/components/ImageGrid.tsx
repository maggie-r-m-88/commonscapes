"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export interface ImageData {
  id: string | number;
  url: string;
  description?: string;
  owner?: string;
  source?: string;
  title?: string;
  tags?: any[];
}

interface ImageGridProps {
  images: ImageData[];
  total?: number;
  page?: number;
  pageSize?: number;
  showTitle?: boolean;
}

export default function ImageGrid({
  images,
  total = 0,
  page = 1,
  pageSize = 12,
  showTitle = true,
}: ImageGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const [jumpValue, setJumpValue] = useState(page);

  useEffect(() => {
    setJumpValue(page);
  }, [page]);

  // ✅ Safe navigation that preserves ALL existing params
  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));

    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced jump input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (jumpValue !== page) {
        goToPage(jumpValue);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [jumpValue]);

  if (!images || images.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        No images found
      </div>
    );
  }

  return (
    <div>
      {/* Grid */}
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
                    {showTitle && (
                      <>
                        <p className="text-sm font-medium line-clamp-1">
                          {img.description}
                        </p>
                        <p className="text-xs text-gray-200 line-clamp-1">
                          {img.owner}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-3">
          {/* Previous */}
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 3L5 8l5 5" />
            </svg>
            Previous
          </button>

          {/* Page Jump */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Page</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setJumpValue(val);
              }}
              className="w-12 h-8 text-center border border-gray-200 rounded font-mono text-sm text-gray-800 focus:outline-none focus:border-gray-400"
            />
            <span>of {totalPages}</span>
          </div>

          {/* Next */}
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 text-sm bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}