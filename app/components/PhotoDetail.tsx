"use client";

interface Photo {
  id: string | number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  src: string;
}

export function PhotoDetail({ photo }: { photo: Photo }) {
  return (
    <div className="min-h-screen p-12 grid grid-cols-3 gap-12">
      {/* LEFT COLUMN */}
      <div className="col-span-1 space-y-4">
        <h1 className="text-2xl font-bold">{photo.title}</h1>
        <p className="text-gray-600">{photo.description}</p>

        <div>
          <h3 className="font-semibold">Category</h3>
          <p>{photo.category}</p>
        </div>

        <div>
          <h3 className="font-semibold">Tags</h3>
          <div className="flex gap-2 flex-wrap">
            {photo.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* IMAGE COLUMN */}
      <div className="col-span-2">
        <img
          src={photo.src}
          alt={photo.title}
          className="w-full rounded-2xl"
          style={{
            viewTransitionName: `photo-${photo.id}`,
          }}
        />
      </div>
    </div>
  );
}
