// app/image-detail/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";

interface ImageData {
  id: number;
  url: string;
  title: string;
  width: number;
  height: number;
  mime: string;
  taken_at?: string;
  source?: string;
  attribution?: string;
  license_name?: string;
  license_url?: string;
  description?: string;
  categories?: string; // JSON string
  owner?: string;
  info_url?: string;
}

interface PageProps {
  params: { id: string };
}

export default async function ImageDetailPage({ params }: PageProps) {
  const { id } = params;

  let imageData: ImageData | null = null;

  try {
    const res = await fetch(`/api/image-detail?id=${id}`);
    if (!res.ok) throw new Error("Image not found");
    imageData = await res.json();
  } catch (err: any) {
    return <div className="p-6 text-red-600">{err.message || "Failed to fetch image"}</div>;
  }

  if (!imageData) return <div className="p-6 text-red-600">Image not found</div>;

  const width = imageData.width || 2000;
  const height = imageData.height || 1500;

  // Parse categories safely
  let categories: string[] = [];
  try {
    categories = imageData.categories ? JSON.parse(imageData.categories) : [];
  } catch {
    categories = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{imageData.title}</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{imageData.title}</h2>
              </div>

              {imageData.info_url && (
                <div className="p-6 border-b border-gray-200">
                  <a
                    href={imageData.info_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <span>View on Wikimedia Commons</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              <div className="p-6 border-b border-gray-200 space-y-4">
                {imageData.attribution && (
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">Creator</div>
                    <div className="text-gray-900 font-medium">{imageData.attribution}</div>
                  </div>
                )}
                {imageData.license_name && (
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">License</div>
                    <a href={imageData.license_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                      {imageData.license_name}
                    </a>
                  </div>
                )}
                {imageData.source && (
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">Source</div>
                    <div className="text-gray-900">{imageData.source}</div>
                  </div>
                )}
              </div>

              {imageData.description && (
                <div className="p-6 border-b border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-2">Description</div>
                  <p className="text-gray-700 text-sm leading-relaxed">{imageData.description}</p>
                </div>
              )}

              {categories.length > 0 && (
                <div className="p-6">
                  <div className="text-xs uppercase text-gray-500 mb-3">Categories</div>
                  <div className="space-y-2">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="w-full text-left px-3 py-2 bg-gray-50 rounded text-sm text-gray-700">{cat}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-900 flex items-center justify-center min-h-[500px]">
                <div className="relative w-full h-full max-h-[calc(100vh-200px)]">
                  <Image
                    src={imageData.url}
                    alt={imageData.title}
                    width={width}
                    height={height}
                    className="w-full h-auto max-h-[calc(100vh-200px)] object-contain"
                    priority
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
