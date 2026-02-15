"use client";

import { useImage } from "@/app/hooks/useImage";
import Image from "next/image";
import BackButton from "@/app/components/BackButton";
import { useParams } from "next/navigation";

export default function ImageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: image, isLoading, error } = useImage(id);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="min-h-screen w-full bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-600">Image not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="mt-8">
          {/* Image container */}
          <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-8">
            <Image
              src={image.url}
              alt={image.title || "Image"}
              fill
              className="grid-image"
              priority
              unoptimized
                style={{
    viewTransitionName: `image-${image.id}`,
  }}
            />
          </div>

          {/* Title */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {image.title || "Untitled"}
            </h1>
            {image.description && (
              <p className="text-gray-600 text-lg mb-6">{image.description}</p>
            )}
            <div className="space-y-2 text-sm text-gray-500">
              {image.owner && <p><strong>Owner:</strong> {image.owner}</p>}
              {image.source && <p><strong>Source:</strong> {image.source}</p>}
              {image.license_name && (
                <p><strong>License:</strong> {image.license_name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
