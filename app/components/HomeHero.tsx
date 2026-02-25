"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Meta from "./Meta";
import { Link } from 'next-view-transitions'
import TagsMeta from "./TagsMeta";
import ImageGrid from "./HomeFeaturedGrid";
import { useFeaturedImages } from "@/app/hooks/useFeaturedImages";
import { useQueryClient } from "@tanstack/react-query";

interface ImageData {
  id: string | number;
  url: string;
  description?: string;
  title?: string;
  artist?: string;
  date?: string;
  source?: string;
  license_name?: string;
  license_url?: string;
  width?: number;
  height?: number;
  mime?: string;
  owner?: string;
  categories?: string[];
}

export default function HomeExplore() {
  const { data, isLoading, error } = useFeaturedImages(5, 2000, 1280);
  const [activeTab, setActiveTab] = useState<"details" | "about" | "tags">("details");
  const queryClient = useQueryClient();

  useEffect(() => {
    const hero = data?.hero || null;
    const images = data?.images || [];
    if (hero) {
      queryClient.setQueryData(["image", String(hero.id)], {
        ...hero,
        id: String(hero.id),
      });
    }
    images.forEach((img) => {
      queryClient.setQueryData(["image", String(img.id)], {
        ...img,
        id: String(img.id),
      });
    });
  }, [data, queryClient]);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-gray-600">Failed to load images</p>
        </div>
      </section>
    );
  }

  const hero = data?.hero || null;
  const images = data?.images || [];
  const [featuredImage, ...smallImages] = images;

  return (
    <section className="w-full">

      {/* ---------------- Grid Images ---------------- */}

      <ImageGrid featuredImage={featuredImage || null} images={smallImages} />
    </section>
  );
}
