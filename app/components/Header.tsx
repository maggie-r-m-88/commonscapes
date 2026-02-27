"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={`py-4 w-full ${isHome ? "bg-pattern" : ""}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center no-underline">
            <Logo />
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