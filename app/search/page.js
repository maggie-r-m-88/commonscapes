"use client"
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search images..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-4 py-2 rounded w-80"
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-gray-900 text-white rounded">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((img) => (
          <div key={img.id} className="border p-2 rounded">
            <img src={img.url} alt={img.title} className="w-full h-48 object-cover mb-2" />
            <h3 className="font-medium">{img.title}</h3>
            <p className="text-sm">{img.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
