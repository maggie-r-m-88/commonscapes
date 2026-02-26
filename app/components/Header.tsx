"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={`py-4 w-full ${isHome ? "bg-pattern" : ""}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center no-underline">
            <svg width="40" height="40" viewBox="0 0 400 400">
              <g>
                <path
                  d="M96.920 143.661 C 74.551 188.299,56.250 226.268,56.250 228.036 C 56.250 229.804,105.658 231.250,166.045 231.250 L 275.839 231.250 237.001 157.813 C 167.755 26.879,156.032 25.695,96.920 143.661 M231.801 89.961 C 216.001 108.999,292.531 231.105,320.313 231.184 C 349.537 231.266,349.944 234.554,311.875 163.020 C 268.009 80.596,251.827 65.831,231.801 89.961 M51.380 285.312 C 55.707 337.482,55.757 337.500,200.000 337.500 C 344.243 337.500,344.293 337.482,348.620 285.312 L 351.548 250.000 200.000 250.000 L 48.452 250.000 51.380 285.312"
                  fill="currentColor"
                />
              </g>
            </svg>

            <div className="logo text-xl font-semibold font-archivo tracking-tight ml-2">
              commonscapes
            </div>
          </Link>

          {/* Search bar aligned right */}
          <div className="ml-auto w-80">
            <SearchBar />
          </div>
        </div>
      </div>
    </header>
  );
}