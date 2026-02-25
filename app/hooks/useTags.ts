"use client";

import { useQuery } from "@tanstack/react-query";

export interface TagData {
  id: number;
  tag: string;
  source: string;
}

export function useTags(id: string | number) {
  return useQuery<TagData[]>({
    queryKey: ["tags", String(id)],
    queryFn: async () => {
      console.log("[useTags] Fetching tags for image", id);
      const res = await fetch(`/api/images/${id}/tags`);
      if (!res.ok) {
        throw new Error(`Failed to fetch tags for image ${id}`);
      }
      const data = await res.json();
      console.log("[useTags] Received tags:", data);
      return data;
    },
    enabled: !!id,          // only fetch when id is defined
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    
  });
}