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
      {/* Search icon */}
      <svg
        viewBox="0 0 56.7 56.7"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
      >
        <path
          d="M42.8 7.3C33-2.4 17.1-2.4 7.3 7.3c-9.8 9.8-9.8 25.7 0 35.5 8.7 8.7 22.2 9.7 32 2.9l9.6 9.6c1.8 1.8 4.7 1.8 6.4 0 1.8-1.8 1.8-4.7 0-6.4l-9.6-9.6c6.8-9.8 5.8-23.3-2.9-32zm-6.2 29.3c-6.4 6.4-16.7 6.4-23.1 0s-6.4-16.7 0-23.1 16.7-6.4 23.1 0 6.4 16.8 0 23.1z"
          fill="currentColor"
        />
      </svg>

      {/* Input */}
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border rounded-lg px-10 py-2 pr-24 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Submit button */}
      <button
        type="submit"
        className="absolute right-0 top-0 bottom-0 px-4 py-2 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 transition"
      >
        Images
      </button>
    </form>
  );
}