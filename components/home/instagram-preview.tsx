import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { DEFAULT_FROM_OUR_KITCHEN, type FromOurKitchenContent } from "@/lib/storefront/content";
import { ReelCardPlayer } from "./reel-card-player";

export function InstagramPreview({ content = DEFAULT_FROM_OUR_KITCHEN }: { content?: FromOurKitchenContent }) {
  const data = content || DEFAULT_FROM_OUR_KITCHEN;

  const publishedReels = (data.reels || []).filter((r) => r.is_published && r.video_url);

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
    <section className="relative py-12 sm:py-6 bg-transparent" id="kitchen-preview">
      <Container className="max-w-4xl mx-auto text-center">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#711e2c]">
          {data.label}
        </p>
        <h2 className="mt-2 font-display text-2xl sm:text-4xl font-semibold leading-tight text-[#2b1719]">
          {data.heading}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-[#6e5b55]">
          {data.description}
        </p>

        {publishedReels.length === 1 && (
          <div className="mx-auto my-6 max-w-[220px] sm:max-w-[250px] aspect-[9/16] rounded-2xl overflow-hidden shadow-soft border border-[#e5d8c6] bg-black">
            <ReelCardPlayer
              src={publishedReels[0].video_url}
              title={publishedReels[0].alt_text || data.heading}
              instagramUrl={publishedReels[0].instagram_url || data.instagramUrl}
              className="h-full w-full"
            />
          </div>
        )}

        {publishedReels.length > 1 && (
          <div className="my-6 flex items-center justify-center gap-4 overflow-x-auto pb-2 pt-1 max-w-full mx-auto snap-x scrollbar-none">
            {publishedReels.map((reel) => (
              <div
                key={reel.id}
                className="w-[180px] sm:w-[210px] aspect-[9/16] shrink-0 rounded-2xl overflow-hidden shadow-soft border border-[#e5d8c6] bg-black relative snap-center"
              >
                <ReelCardPlayer
                  src={reel.video_url}
                  title={reel.alt_text}
                  instagramUrl={reel.instagram_url || data.instagramUrl}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Link
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#711e2c]/30 bg-[#fffdf8] px-5 text-xs sm:text-sm font-semibold text-[#711e2c] transition-all hover:bg-[#f4efeb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-95"
            href={data.instagramUrl || "https://www.instagram.com/namma_ada/"}
            target="_blank"
            rel="noreferrer"
          >
            <span>{data.instagramButtonText || "Follow us on Instagram"}</span>
            <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

