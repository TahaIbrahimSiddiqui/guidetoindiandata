import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-white">Indian Data Guide</p>
          <p className="mt-1 max-w-md text-sm text-slate-400">
            A research-oriented catalog of India&apos;s public and restricted
            datasets—normalized for access friction, geography, and time.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <Link href="/explore" className="hover:text-cyan-300">
            Explore
          </Link>
          <Link href="/clusters" className="hover:text-cyan-300">
            Clusters
          </Link>
          <Link href="/about" className="hover:text-cyan-300">
            About
          </Link>
          <Link href="/privacy" className="hover:text-cyan-300">
            Privacy & advertising
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        Editorial catalog based on independent research. Not an official
        government portal.
      </div>
    </footer>
  );
}
