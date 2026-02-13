
import { notFound } from "next/navigation";
import { PhotoDetail } from "@/app/components/PhotoDetail";

export const photos = [
  {
    id: "1",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Interior_view_of_the_main_hall_of_Bongeunsa_temple_in_Seoul_South_Korea.jpg/1300px-Interior_view_of_the_main_hall_of_Bongeunsa_temple_in_Seoul_South_Korea.jpg",
    title: "Mountain Light",
    description: "Shot at sunrise in the Alps.",
    tags: ["nature", "mountains"],
    category: "Landscape",
  },
  {
    id: "2",
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Buxoro_arki._Arxeologik_muzey_ichki_bezaklaridan_biri_02.jpg/1300px-Buxoro_arki._Arxeologik_muzey_ichki_bezaklaridan_biri_02.jpg",
    title: "City Mood",
    description: "Night photography downtown.",
    tags: ["urban", "night"],
    category: "Street",
  },
];
export default async function PhotoPage({ params }) {
  const { id } = await params;
  const photo = photos.find((p) => p.id === id);

  if (!photo) return notFound();

  return <PhotoDetail photo={photo} />;
}
