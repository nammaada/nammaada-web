import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { DEFAULT_FROM_OUR_KITCHEN, type FromOurKitchenContent } from "@/lib/storefront/content";
import { ReelCardPlayer } from "./reel-card-player";

export function InstagramPreview({ content = DEFAULT_FROM_OUR_KITCHEN }: { content?: FromOurKitchenContent }) {
  const data = content || DEFAULT_FROM_OUR_KITCHEN;

  // Filter published reels
  const publishedReels = (data.reels || []).filter((r) => r.is_published && r.video_url);

  // If no reels array but legacy video exists, use it
  if (publishedReels.length === 0 && data.reelVideoUrl) {
    publishedReels.push({
      id: "legacy",
      video_url: data.reelVideoUrl,
      cloudinary_public_id: data.reelVideoPublicId || "",
      alt_text: data.reelVideoAltText || data.heading,
      instagram_url: data.instagramUrl,
      display_order: 1,
      is_published: true,
      created_at: "",
    });
  }

  return (
    <section className="py-12 sm:py-16 overflow-hidden" id="kitchen-preview">
      <Container className="max-w-4xl mx-auto text-center">
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#6b212b]">
          {data.label}
        </p>
        <h2 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-[34px] font-normal leading-snug text-foreground">
          {data.heading}
        </h2>
        <p className="mx-auto mt-2.5 max-w-md text-xs sm:text-sm leading-relaxed text-[#5c3e41]/85">
          {data.description}
        </p>

        {/* Compact, clean, natural portrait reel video - only plays on hover */}
        {publishedReels.length === 1 && (
          <div className="mx-auto my-5 max-w-[240px] sm:max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-black">
            <ReelCardPlayer
              src={publishedReels[0].video_url}
              title={publishedReels[0].alt_text || data.heading}
              className="h-full w-full"
            />
          </div>
        )}

        {/* If multiple reels exist: Clean compact responsive scroll - each plays only when hovered */}
        {publishedReels.length > 1 && (
          <div className="my-6 flex items-center justify-center gap-4 sm:gap-5 overflow-x-auto pb-2 pt-1 max-w-full mx-auto snap-x">
            {publishedReels.map((reel) => (
              <div
                key={reel.id}
                className="w-[190px] sm:w-[220px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden shadow-lg bg-black relative snap-center"
              >
                <ReelCardPlayer
                  src={reel.video_url}
                  title={reel.alt_text}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Link
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-primary/30 px-5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            href={data.instagramUrl || "https://www.instagram.com/namma_ada/"}
            target="_blank"
            rel="noreferrer"
          >
            <span>{data.instagramButtonText || "Follow us on Instagram"}</span>
            <ArrowUpRight aria-hidden="true" size={13} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
