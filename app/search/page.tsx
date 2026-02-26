import { Suspense } from "react";
import SearchResults from "./search-results";

export default function Page() {
  return (
    <div className="p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}