import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { DEFAULT_WHO_WE_ARE, type WhoWeAreContent } from "@/lib/storefront/content";
import { StoryCardVisual } from "./story-card-visual";

export function StoryPreview({ content = DEFAULT_WHO_WE_ARE }: { content?: WhoWeAreContent }) {
  const data = content || DEFAULT_WHO_WE_ARE;

  return (
    <section className="py-16 sm:py-24 overflow-hidden" id="about-preview">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14 xl:gap-20">
        {/* Left Column: Large clean standalone image */}
        <div className="w-full flex justify-center">
          <StoryCardVisual images={data.images || []} />
        </div>

        {/* Right Content Column */}
        <div className="text-left">
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.24em] text-[#6b212b]">
            {data.label}
          </p>

          <h2 className="mt-3.5 font-display text-3xl sm:text-4xl lg:text-[44px] font-normal leading-[1.12] text-foreground tracking-tight max-w-xl">
            {data.heading}
          </h2>

          <p className="mt-5 max-w-lg text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#5c3e41]/85">
            {data.description}
          </p>

          <Link
            className="mt-7 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5c111a] hover:text-[#3d0b13] transition-colors pb-0.5 border-b border-[#5c111a]/30 hover:border-[#5c111a]"
            href={data.buttonUrl || "/about"}
          >
            <span>{data.buttonText || "Read our story"}</span>
            <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
