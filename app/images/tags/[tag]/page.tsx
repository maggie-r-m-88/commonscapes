"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

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
  const tag = params.tag; // will be "ferris wheel"

  const [featuredImage, setFeaturedImage] = useState<ImageData | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tag) return;

    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/images/tags/${encodeURIComponent(tag)}`);
        const data = await res.json();
        if (data?.images?.length > 0) {
          setFeaturedImage(data.images[0]);
          setImages(data.images.slice(1));
        } else {
          setFeaturedImage(null);
          setImages([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [tag]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading images for "{tag}"...
      </div>
    );

  if (!featuredImage && images.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        No images found for "{tag}"
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Images tagged: "{tag}"</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {featuredImage && (
          <Link key={featuredImage.id} href={`/images/${featuredImage.id}`} className="md:col-span-2 md:row-span-2">
            <div className="relative h-full min-h-96 bg-gray-100 rounded shadow group cursor-pointer overflow-hidden">
              <Image
                src={featuredImage.url}
                alt={featuredImage.description || ""}
                fill
                className="object-cover"
                unoptimized
                priority
                style={{
                      viewTransitionName: `image-${featuredImage.id}`,
                }}
              />
              <div className="absolute inset-0 bg-black/60 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white">
                  <p className="text-xl font-medium">{featuredImage.description}</p>
                  <p className="text-gray-200">{featuredImage.owner} · {featuredImage.source}</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {images.map((img) => (
          <Link key={img.id} href={`/images/${img.id}`}>
            <div className="relative aspect-[4/3] bg-gray-100 rounded shadow group cursor-pointer overflow-hidden">
              <Image src={img.url} alt={img.description || ""} fill className="object-cover" unoptimized 
              
              />
              <div className="absolute inset-0 bg-black/60 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-white">
                  <p className="text-sm font-medium line-clamp-1">{img.description}</p>
                  <p className="text-xs text-gray-200 line-clamp-1">{img.owner}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
