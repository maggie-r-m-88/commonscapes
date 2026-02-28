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

      {/* Input */}
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Submit button with icon + text */}
      <button
        type="submit"
        className="absolute right-0 top-0 bottom-0 px-4 py-2 bg-[#657B75] text-white text-semibold rounded-r-lg flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
      >
        {/* Example search icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z"
          />
        </svg>

      </button>
    </form>
  );
}