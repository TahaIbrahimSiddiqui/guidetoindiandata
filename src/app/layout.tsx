import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible,
  Crimson_Pro,
  IBM_Plex_Mono,
} from "next/font/google";
import { websiteJsonLd, serializeJsonLd } from "@/lib/seo/jsonLd";
import { rootMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import "./globals.css";

/** Academic display — ui-ux-pro-max Academic/Research pairing */
const display = Crimson_Pro({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** High-readability body */
const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = rootMetadata();

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
        display.variable,
        body.variable,
        mono.variable,
      )}
    >
      <body className="min-h-dvh bg-black font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(websiteJsonLd()),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  if (location.hostname.toLowerCase() !== "tahaibrahimsiddiqui.github.io") return;
  const target = "https://tahaibrahim.in" + location.pathname + location.search + location.hash;
  location.replace(target);
})();`,
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
