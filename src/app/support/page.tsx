import type { Metadata } from "next";
import { ArrowUpRight, Coffee, Globe2, HeartHandshake, IndianRupee } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/metadata";

const KOFI_URL = "https://ko-fi.com/tahaibrahim";
const UPI_URL =
  "https://onlychai.neocities.org/support.html?name=Taha%20Ibrahim%20Siddiqui&upi=taha.i.siddiq-1%40okhdfcbank";

export const metadata: Metadata = buildPageMetadata({
  title: "Support",
  description:
    "Support the Indian Data Guide and help keep public data goods freely available.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <div>
      <header className="mb-10 max-w-3xl">
        <p className="page-kicker">Support</p>
        <h1 className="page-title">Keep public data goods alive</h1>
        <p className="page-lede">
          If you enjoy what I&apos;m doing and would like me to continue making
          public data goods, you can encourage me by buying me a coffee or chai.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Support options">
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="surface-elevated group flex min-h-[16rem] flex-col justify-between p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C4A574]/55 sm:p-8"
        >
          <span className="flex size-11 items-center justify-center rounded-md border border-[#C4A574]/35 bg-[#C4A574]/10 text-[#F3E4C9]">
            <Globe2 className="size-5" aria-hidden />
          </span>
          <span>
            <span className="mt-8 block font-display text-2xl font-semibold text-[#F3E4C9]">
              Support from abroad
            </span>
            <span className="mt-3 block text-sm leading-relaxed text-[#D3D4C0]/88">
              Use Ko-fi if you are outside India or prefer an international
              card/payment flow.
            </span>
          </span>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#C4A574]">
            Open Ko-fi
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>

        <a
          href={UPI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="surface-elevated group flex min-h-[16rem] flex-col justify-between p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C4A574]/55 sm:p-8"
        >
          <span className="flex size-11 items-center justify-center rounded-md border border-[#C4A574]/35 bg-[#C4A574]/10 text-[#F3E4C9]">
            <IndianRupee className="size-5" aria-hidden />
          </span>
          <span>
            <span className="mt-8 block font-display text-2xl font-semibold text-[#F3E4C9]">
              Support from India
            </span>
            <span className="mt-3 block text-sm leading-relaxed text-[#D3D4C0]/88">
              Use the UPI chai link if that is the easiest way to send a small
              thank-you.
            </span>
          </span>
          <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#C4A574]">
            Open UPI link
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>
      </section>

      <section className="surface mt-8 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-[#C4A574]/30 bg-[#C4A574]/10 text-[#F3E4C9]">
            <HeartHandshake className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="section-title">Why it helps</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#D3D4C0]/92">
              Every little bit helps me keep exploring, analyzing, and sharing
              useful Indian data resources in public. Thank you for supporting
              work that stays useful for students, researchers, journalists, and
              builders.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#C4A574]/25 bg-[#C4A574]/8 px-3 py-2 text-xs font-medium text-[#D3D4C0]/85">
              <Coffee className="size-4 text-[#C4A574]" aria-hidden />
              Coffee, chai, and more public datasets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
