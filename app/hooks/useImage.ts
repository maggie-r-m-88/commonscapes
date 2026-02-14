import { useQuery } from "@tanstack/react-query";

interface ImageRow {
  id?: number;
  url: string;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
  added_at?: string | null;
  taken_at?: string | null;
  source?: string | null;
  attribution?: string | null;
  license_name?: string | null;
  license_url?: string | null;
  description?: string | null;
  categories?: any | null;
  owner?: string | null;
}

export function useImage(id: string | number) {
  return useQuery<ImageRow>({
    queryKey: ["image", id],
    queryFn: async () => {
      const res = await fetch(`/api/images/${id}`);
      if (!res.ok) {
        throw new Error("Image not found");
      }
      return res.json();
    },
  });
}
