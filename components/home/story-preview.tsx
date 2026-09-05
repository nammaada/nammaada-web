import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { DEFAULT_WHO_WE_ARE, type WhoWeAreContent } from "@/lib/storefront/content";
import { StoryCardVisual } from "./story-card-visual";

export function StoryPreview({ content = DEFAULT_WHO_WE_ARE }: { content?: WhoWeAreContent }) {
  const data = content || DEFAULT_WHO_WE_ARE;

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent overflow-hidden" id="about-preview">
      <Container className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
        {/* Left Column: Visual */}
        <div className="w-full flex justify-center">
          <StoryCardVisual images={data.images || []} />
        </div>

        {/* Right Column: Editorial Text */}
        <div className="text-left">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#4a0e17]">
            {data.label}
          </p>

          <h2 className="mt-2 font-display text-2xl sm:text-4xl font-semibold leading-tight text-[#2b1719] max-w-xl">
            {data.heading}
          </h2>

          <p className="mt-4 max-w-lg text-xs sm:text-sm sm:text-base leading-relaxed text-[#6e5b55]">
            {data.description}
          </p>

          <div className="pt-4 sm:pt-6">
            <Link
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4a0e17] hover:text-[#380a11] transition-colors pb-0.5 border-b border-[#4a0e17]/30 hover:border-[#4a0e17]"
              href={data.buttonUrl || "/about"}
            >
              <span>{data.buttonText || "Read our story"}</span>
              <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

