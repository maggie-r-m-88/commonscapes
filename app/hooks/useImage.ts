import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ImageRow {
  id?: number;
  url: string;
  info_url?: string;
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
  const queryClient = useQueryClient();

  const key = ["image", String(id)];
  const cachedData = queryClient.getQueryData<ImageRow>(key);

  return useQuery<ImageRow>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(`/api/images/${id}`);
      if (!res.ok) {
        throw new Error("Image not found");
      }
      return res.json();
    },
    initialData: cachedData ?? undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
