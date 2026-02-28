"use client";

import Image from "next/image";
import BackButton from "@/app/components/BackButton";
import { useParams } from "next/navigation";
import { Link } from "next-view-transitions";
import { removeFilename } from "@/lib/remove-filename";
import { useImage } from "@/app/hooks/useImage";
import { useTags } from "@/app/hooks/useTags";
import { useTaxonomy } from "@/app/hooks/useTaxonomy";
import { useState, useEffect } from "react";
import Loader from "@/app/components/Loader";

interface RelatedImage {
  id: number;
  url: string;
  title?: string;
  width?: number;
  height?: number;
  description?: string;
}

export default function ImageDetailPage() {
  const params = useParams();
  const id = params.id as string;

  // ✅ Fetch main image, tags, and taxonomy using hooks with caching
  const { data: image, isLoading, error } = useImage(id);
  const { data: tags = [], isLoading: tagsLoading } = useTags(id);
  const { data: taxonomy = [], isLoading: taxLoading } = useTaxonomy(id);

  // ⚡ Related images (still using manual fetch for now)
  const [relatedImages, setRelatedImages] = useState<RelatedImage[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setRelatedLoading(true);

    fetch(`/api/images/${id}/related`)
      .then((res) => res.json())
      .then((data) => setRelatedImages(data || []))
      .catch((err) => console.error("Failed to fetch related images:", err))
      .finally(() => setRelatedLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gray-100 p-6 flex items-center justify-center">
        <Loader />
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
    <div className="min-h-screen w-full bg-pattern p-6">
      <div className="max-w-4xl xl:max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">

              {/* Info & Back */}
              <div className="p-6 border-b border-gray-200 text-center space-y-2 transition-shadow">
                {image.info_url && (
                  <a
                    href={image.info_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#657B75] hover:bg-[#000] text-white rounded-lg transition-colors shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span className="font-medium">View Source</span>

                  </a>
                )}

                <BackButton />
              </div>

              {/* Taxonomy */}
              {taxonomy.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-4">Categories</div>
                  <div className="">
                    {taxonomy.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/images/categories/${cat.slug}`}
                        className="block px-2 py-1 bg-gray-50 rounded-sm text-sm mb-1 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}


              {/* Description */}
              {image.description && (
                <div className="p-6 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-2">Description</div>
                  <p className="text-gray-700 text-sm leading-relaxed">{image.description}</p>
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-4">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <Link
                        key={t.id}
                        href={`/images/tags/${encodeURIComponent(t.tag)}`}
                        className="px-2 py-1 bg-[#f3f4f6] rounded-full text-xs hover:bg-gray-300 transition-colors"
                      >
                        {t.tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}


              {/* Attribution / License / Source */}
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

              {/* Technical Details */}
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
                        ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
                          new Date(image.taken_at)
                        )
                        : "Unknown"}
                    </div>
                    <div className="text-left font-medium text-gray-500">Format</div>
                    <div className="text-right text-gray-700">{image.mime}</div>
                  </div>
                </div>
              )}



            </div>
          </aside>

          {/* Main Image */}
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
                    style={{ viewTransitionName: `image-${image.id}` }}
                  />
                </div>
              </div>
            </div>

            {/* Related Images */}
            <div className="my-8">
              <h2 className="text-base font-bold text-gray-900 break-words mb-6">Related Images</h2>
              {relatedLoading ? (
                <div className="flex items-center justify-center py-10 my-10">
                  <Loader />
                </div>
              ) : error ? (
                <p className="text-gray-500">Failed to load related images.</p>
              ) : relatedImages.length === 0 ? (
                <p className="text-gray-500">No related images found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {relatedImages.map((rel) => (
                    <Link key={rel.id} href={`/images/${rel.id}`}>
                      <div className="relative w-full h-48 rounded overflow-hidden shadow hover:shadow-lg transition-shadow bg-gray-100">
                        <Image
                          src={rel.url}
                          alt={rel.title || "Related image"}
                          fill
                          className="object-cover"
                          unoptimized
                          style={{ viewTransitionName: `image-${rel.id}` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}