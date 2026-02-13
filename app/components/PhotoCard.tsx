"use client";

import Link from "next/link";

export function PhotoCard({ photo }: { photo: any }) {
  return (
    <Link href={`/photo/${photo.id}`} className="block mb-4">
      <img
        src={photo.src}
        alt={photo.title}
        className="w-full rounded-xl"
        style={{
          viewTransitionName: `photo-${photo.id}`,
        }}
      />
    </Link>
  );
}
