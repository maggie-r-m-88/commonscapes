
import { PhotoCard } from "./PhotoCard";

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


export function PhotoGrid() {
  return (
    <div className="columns-2 md:columns-3 gap-4 p-8">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
