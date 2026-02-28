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

function PillPagination({
  page,
  totalPages,
  goToPage,
}: {
  page: number;
  totalPages: number;
  goToPage: (p: number) => void;
}) {
  const [jumpValue, setJumpValue] = useState(page);

  useEffect(() => {
    setJumpValue(page);
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (jumpValue !== page) goToPage(jumpValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [jumpValue]);

  return (
    <div className="flex justify-center">
      <div className="flex items-stretch rounded-lg overflow-hidden bg-white shadow">

        {/* Previous */}
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2.5 bg-white font-semibold border-r border-[#e0ddd6] shadow hover:shadow-md transition-shadow disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#555]"
        
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {/* Page input */}
        <div className="flex items-center gap-2 px-5 text-lg text-gray-400">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) setJumpValue(val);
            }}
            className="w-[52px] text-center bg-white font-mono text-lg font-semibold text-[#1c1c1e] py-1.5 px-1 outline-none focus:border-[#1c1c1e] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span>/ {totalPages}</span>
        </div>

        {/* Next */}
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-2 px-4 py-2.5 bg-white font-semibold text-[#555] border-l border-[#e0ddd6] transition-colors duration-150 hover:bg-[#1c1c1e] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#555]"
        >
          Next
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </div>
  );
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

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!images || images.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        No images found
      </div>
    );
  }

  return (
    <div>
      {/* Top Pagination */}
      {totalPages > 1 && (
        <div className="my-6">
          <PillPagination page={page} totalPages={totalPages} goToPage={goToPage} />
        </div>
      )}

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
                  ? `md:col-span-2 md:row-span-2 ${isRightSide ? "md:col-start-2" : ""}`
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
                        <p className="text-sm font-medium line-clamp-1">{img.description}</p>
                        <p className="text-xs text-gray-200 line-clamp-1">{img.owner}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <PillPagination page={page} totalPages={totalPages} goToPage={goToPage} />
        </div>
      )}
    </div>
  );
}
