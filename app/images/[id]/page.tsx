import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import BackButton from "@/app/components/BackButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ImageDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch image from Supabase
  const { data: image, error } = await supabase
    .from("images")
    .select("*")
    .eq("id", parseInt(id))
    .single();

  if (error || !image) {
    notFound();
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
