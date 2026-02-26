"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}&type=images`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 pr-24 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        type="submit"
        className="absolute right-0 top-0 bottom-0 px-4 py-2 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 transition"
      >
        Search
      </button>
    </form>
  );
}