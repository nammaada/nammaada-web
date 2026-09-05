import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { DEFAULT_WHO_WE_ARE, type WhoWeAreContent } from "@/lib/storefront/content";
import { StoryCardVisual } from "./story-card-visual";

export function StoryPreview({ content = DEFAULT_WHO_WE_ARE }: { content?: WhoWeAreContent }) {
  const data = content || DEFAULT_WHO_WE_ARE;

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-transparent overflow-hidden" id="about-preview">
      <Container>
        <div className="mx-auto max-w-4xl lg:max-w-[960px] flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left Column: Visual */}
          <div className="w-full sm:w-[320px] lg:w-[340px] shrink-0 flex justify-center">
            <StoryCardVisual images={data.images || []} />
          </div>

          {/* Right Column: Short Editorial Text */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#711e2c]">
              WHO WE ARE
            </p>

            <h2 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.2] text-[#2b1719]">
              A little taste of home, made with a whole lot of love.
            </h2>

            <p className="mt-4 text-xs sm:text-sm lg:text-base leading-relaxed text-[#5a4843]">
              Namma Ada is a Bangalore-based Kerala delicacy brand inspired by recipes passed down through generations. We bring Kerala&apos;s timeless taste to your table through fresh, handcrafted delicacies made with authentic flavours and a whole lot of love.
            </p>

            <div className="mt-6">
              <Link
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#711e2c] hover:text-[#5a1723] transition-colors pb-0.5 border-b border-[#711e2c]/30 hover:border-[#711e2c]"
                href="/about"
              >
                <span>Read our story</span>
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

