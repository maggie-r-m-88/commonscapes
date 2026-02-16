export default function Header() {
  return (
    <header className="pt-12 pb-8 w-full">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center text-gray-600">

          {/* GALLERY ICON - font-archivo */}
          <svg className="" width="32" height="32" viewBox="0 0 40 40" fill="none">
  {/* Top-left - FILLED */}
  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" opacity="0.8" />
  <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
  {/* Top-right */}
  <rect x="22" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
  {/* Bottom-left */}
  <rect x="6" y="22" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
  {/* Bottom-right - FILLED */}
  <rect x="22" y="22" width="12" height="12" rx="2" fill="currentColor" opacity="0.8" />
  <rect x="22" y="22" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
</svg>

          <div className="logo text-2xl font-bold font-archivo tracking-[-0.02em]">
            Commonscapes
          </div>
        </div>
      </div>
    </header>
  );
}
