"use client";

import { useQuery } from "@tanstack/react-query";

export interface TaxonomyData {
  id: number;
  name: string;
  description: string;
  slug: string;
}

export function useTaxonomy(id: string | number) {
  return useQuery<TaxonomyData[]>({
    queryKey: ["taxonomy", String(id)],
    queryFn: async () => {
      console.log("[useTaxonomy] Fetching taxonomy for image", id);
      const res = await fetch(`/api/images/${id}/taxonomy`);
      if (!res.ok) {
        throw new Error(`Failed to fetch taxonomy for image ${id}`);
      }
      const data = await res.json();
      console.log("[useTaxonomy] Received taxonomy:", data);
      return data;
    },
    enabled: !!id,          // only fetch when id is defined
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,

  });
}