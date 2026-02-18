"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ImageData {
  id: string | number;
  url: string;
  description?: string;
  owner?: string;
  source?: string;
  title?: string;
}

export default function TagPage() {
  const params = useParams();
  const tag = params.tag as string;

  const [featuredImage, setFeaturedImage] = useState<ImageData | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) return;

    async function fetchImages() {
      setLoading(true);
      try {
        const res = await fetch(`/api/images/tags?tag=${encodeURIComponent(tag)}`);
        const data = await res.json();

        if (data?.images?.length > 0) {
          setFeaturedImage(data.images[0]);       // first image as featured
          setImages(data.images.slice(1));       // remaining images in grid
        }
      } catch (err) {
        console.error("Failed to fetch images for tag:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [tag]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading images for "{tag}"...</p>
      </div>
    );
  }

  if (!featuredImage && images.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No images found for "{tag}"</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Images tagged: "{tag}"</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Featured image */}
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

        {/* Remaining grid images */}
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

      </div>
    </div>
  );
}
