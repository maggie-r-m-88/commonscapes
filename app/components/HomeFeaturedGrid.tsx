"use client";

import { Link } from 'next-view-transitions'
import Image from "next/image";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface ImageRow {
  id?: number;
  url: string;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
  added_at?: string | null;
  taken_at?: string | null;
  source?: string | null;
  attribution?: string | null;
  license_name?: string | null;
  license_url?: string | null;
  description?: string | null;
  categories?: any | null;
  owner?: string | null;
}

interface ImageData {
  id: string | number;
  url: string;
  description?: string;
  owner?: string;
  source?: string;
  title?: string;
}

interface ImageGridProps {
  featuredImage?: ImageData | null;
  images: ImageData[];
}


export default function ImageGrid({ featuredImage, images }: ImageGridProps) {
  const queryClient = useQueryClient();

  // Pre-populate React Query cache with grid images
  useEffect(() => {
    if (featuredImage) {
      queryClient.setQueryData(["image", String(featuredImage.id)], {
        ...featuredImage,
        id: String(featuredImage.id),
      });
    }
    images.forEach((image) => {
      queryClient.setQueryData(["image", String(image.id)], {
        ...image,
        id: String(image.id),
      });
    });
  }, [featuredImage, images, queryClient]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Large featured image in grid */}
      {featuredImage && (
        <Link
          key={featuredImage.id}
          href={`/images/${featuredImage.id}`}
          className="md:col-span-2 md:row-span-2"
        >
          <div className="grid-item overflow-hidden rounded-sm shadow-md bg-white relative group cursor-pointer h-full transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="relative h-full min-h-96 bg-gray-100">
              <Image
                src={featuredImage.url}
                alt={featuredImage.description || ""}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="grid-image"
                priority
                unoptimized
                style={{
                  viewTransitionName: `image-${featuredImage.id}`,
                  willChange: "transform",
                }}
              />
              <div className="absolute inset-0 bg-black/60 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white">
                  <p className="text-xl font-medium mb-1">{featuredImage.description}</p>
                  <p className="text-gray-200">{featuredImage.owner} · {featuredImage.source}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Small grid images */}
      {images.map((image) => (
        <Link key={image.id} href={`/images/${image.id}`}>
          <div className="grid-item overflow-hidden rounded-sm shadow-md bg-white relative group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src={image.url}
                alt={image.description || ""}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                unoptimized
                style={{
                  viewTransitionName: `image-${image.id}`,
                  willChange: "transform",
                }}
              />
              <div className="absolute inset-0 bg-black/60 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white">
                  <p className="text-sm font-medium line-clamp-1">{image.description}</p>
                  <p className="text-xs text-gray-200 line-clamp-1">{image.owner}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {/* CTA Card */}
      <Link
        href="/collection"
        className="grid-item overflow-hidden shadow-md rounded-sm bg-gradient-to-br from-[#444B4B] to-[#657B75] cursor-pointer transition-all group relative cta-card"
      >
        {/* Faded logo watermark */}
        <svg
          width="190" height="190"
          viewBox="0 0 400 400"
          className="absolute -bottom-10 -right-10 opacity-[0.3] text-white"
          fill="currentColor"
        >
          <path d="M96.920 143.661 C 74.551 188.299,56.250 226.268,56.250 228.036 C 56.250 229.804,105.658 231.250,166.045 231.250 L 275.839 231.250 237.001 157.813 C 167.755 26.879,156.032 25.695,96.920 143.661 M231.801 89.961 C 216.001 108.999,292.531 231.105,320.313 231.184 C 349.537 231.266,349.944 234.554,311.875 163.020 C 268.009 80.596,251.827 65.831,231.801 89.961 M51.380 285.312 C 55.707 337.482,55.757 337.500,200.000 337.500 C 344.243 337.500,344.293 337.482,348.620 285.312 L 351.548 250.000 200.000 250.000 L 48.452 250.000 51.380 285.312" />
        </svg>

        {/* Content */}
        <div className="relative z-10 p-6 w-full h-full flex flex-col justify-end">
          <h4 className="text-white text-3xl leading-snug tracking-tight">
            Explore the<br />
            collection{" "}
            <span className="inline-block text-white/50 group-hover:translate-x-1 transition-transform"></span>
          </h4>
        </div>
      </Link>
    </div>
  );
}
