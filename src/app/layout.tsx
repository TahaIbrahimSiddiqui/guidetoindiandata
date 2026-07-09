import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible,
  Crimson_Pro,
  IBM_Plex_Mono,
} from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Indian Data Guide",
    template: "%s · Indian Data Guide",
  },
  description:
    "Discover Indian datasets across health, labour, agriculture, elections, climate, academic archives, and community GitHub sources.",
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
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
