"use client";

import { useImage } from "@/app/hooks/useImage";
import Image from "next/image";
import BackButton from "@/app/components/BackButton";
import { useParams } from "next/navigation";
import { removeFilename } from "@/lib/remove-filename";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TagData {
  id: number;
  tag: string;
  source: string;
}

export default function ImageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: image, isLoading, error } = useImage(id);
  const [tags, setTags] = useState<TagData[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Fetch tags separately from the image
  useEffect(() => {
    if (!id) return;

    setTagsLoading(true);
    fetch(`/api/images/${id}`)
      .then(res => res.json())
      .then(data => {
        setTags(data.tags || []);
      })
      .catch(err => console.error("Failed to fetch tags:", err))
      .finally(() => setTagsLoading(false));
  }, [id]);

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

  const imageTitle = image.title ? removeFilename(image.title) : "Untitled";

  return (

    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/*               <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 break-words">{imageTitle}</h2>
              </div> */}

              {tags && tags.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-4">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Link
                        key={t.id}
                        href={`/images/tags/${encodeURIComponent(t.tag)}`} // encode for URL safety
                        className="px-2 py-1 bg-[#f3f4f6] rounded-full text-xs hover:bg-gray-300 transition-colors"
                      >
                        {t.tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}



              <div className="p-6 border-b border-gray-200 text-center">
                <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors">
                  <BackButton />
                </div>
                {image.info_url && (<a
                  href={image.info_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>View Source</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>)}

              </div>

              {image.description && (
                <div className="p-6 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-2">Description</div>
                  <p className="text-gray-700 text-sm leading-relaxed">{image.description}</p>
                </div>
              )}


              <div className="p-6 border-b border-gray-200 space-y-4">
                {image.attribution && (
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">Creator</div>
                    <div className="text-gray-700">{image.owner}</div>
                  </div>
                )}
                {image.license_name && image.license_url && (
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">License</div>
                    <a
                      href={image.license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {image.license_name}
                    </a>
                  </div>
                )}
                {image.source && (
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">Source</div>
                    <div className="text-gray-700">{image.source}</div>
                  </div>
                )}
              </div>

              {image.width && (
                <div className="p-6 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-3">Technical Details</div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-left font-medium text-gray-500">Dimensions</div>
                    <div className="text-right text-gray-700">
                      {image.width} × {image.height} px
                    </div>

                    <div className="text-left font-medium text-gray-500">Date</div>
                    <div className="text-right text-gray-700">
                      {image.taken_at
                        ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(image.taken_at))
                        : 'Unknown'}
                    </div>
                    <div className="text-left font-medium text-gray-500">Format</div>
                    <div className="text-right text-gray-700">{image.mime}</div>

                  </div>
                </div>
              )}


            </div>
          </aside>


          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 flex items-center justify-center min-h-[500px]">
                <div className="relative w-full h-[500px]">
                  <Image
                    src={image.url}
                    alt={imageTitle || "Image"}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                    style={{
                      viewTransitionName: `image-${image.id}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>

  );
}
