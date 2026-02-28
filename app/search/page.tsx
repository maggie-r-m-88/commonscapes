import { Suspense } from "react";
import SearchResults from "./search-results";
import Loader from "@/app/components/Loader";

export default function Page() {
  return (
    <div className="p-8 bg-pattern">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}