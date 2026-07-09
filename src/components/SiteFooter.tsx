import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-obsidian-border bg-obsidian-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-obsidian-text">
            Indian Data Guide
          </p>
          <p className="mt-1 max-w-md text-sm text-obsidian-muted">
            Series hubs with years · wave-level access metadata · not an official
            government portal.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-obsidian-muted">
          <Link href="/series" className="hover:text-obsidian-purple-bright">
            Series
          </Link>
          <Link href="/explore" className="hover:text-obsidian-purple-bright">
            Explore
          </Link>
          <Link href="/about" className="hover:text-obsidian-purple-bright">
            About
          </Link>
          <Link href="/privacy" className="hover:text-obsidian-purple-bright">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
