import Image from "next/image";
import { Leaf } from "lucide-react";
import type { HeroMediaConfig } from "@/lib/storefront/hero";

export function HeroMediaSlot({ config }: { config: HeroMediaConfig }) {
  const hasCustomMedia = Boolean(config.media_url);

  return (
    <div
      className="relative h-80 w-full overflow-hidden rounded-[2rem] border border-primary-foreground/25 bg-[radial-gradient(circle_at_62%_35%,rgb(212_175_55_/_0.3),transparent_18%),radial-gradient(circle_at_20%_80%,rgb(255_253_248_/_0.12),transparent_28%),linear-gradient(135deg,rgb(112_24_34),rgb(53_8_17))] shadow-lifted sm:h-[26rem] lg:h-[29rem]"
    >
      {hasCustomMedia ? (
        config.media_type === "video" ? (
          <>
            {/* Main Autoplay Video */}
            <video
              autoPlay
              className="h-full w-full object-cover transition-opacity duration-300 motion-reduce:hidden"
              loop
              muted
              playsInline
              poster={config.poster_url || undefined}
              preload="metadata"
            >
              <source src={config.media_url!} />
            </video>

            {/* Accessible Fallback Poster for Reduced Motion preference */}
            {config.poster_url && (
              <img
                alt={config.alt_text || "Namma Ada authentic Kerala food video"}
                className="hidden h-full w-full object-cover motion-reduce:block"
                src={config.poster_url}
              />
            )}
          </>
        ) : (
          <Image
            alt={config.alt_text || "Namma Ada authentic Kerala handcrafted delicacies"}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={config.media_url!}
          />
        )
      ) : (
        /* Craft Illustration Fallback when no custom media is uploaded */
        <>
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-accent/30 bg-accent/10 blur-sm" aria-hidden="true" />
          <div className="absolute -bottom-14 -left-10 h-48 w-48 rounded-full border border-primary-foreground/15" aria-hidden="true" />
          <div className="absolute left-12 top-16 h-28 w-12 -rotate-[42deg] rounded-[100%_0] border border-accent/35 bg-accent/10" aria-hidden="true" />
          <div className="absolute bottom-28 right-16 h-24 w-10 rotate-[42deg] rounded-[0_100%] border border-primary-foreground/20 bg-primary-foreground/10" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 shadow-[0_24px_60px_rgb(0_0_0_/_0.18)] sm:h-72 sm:w-72" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30 bg-accent/10 sm:h-48 sm:w-48" aria-hidden="true" />
          
          <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary/35 px-4 py-2.5 text-xs font-semibold text-primary-foreground/85 backdrop-blur-sm sm:right-6 sm:top-6">
            <Leaf aria-hidden="true" className="text-accent" size={16} />
            Crafted with care
          </div>
          
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-primary-foreground/20 bg-primary/35 px-4 py-3 text-center backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/75">Authentic Kerala Heritage</p>
            <p className="mt-0.5 text-xs text-primary-foreground/60">Handcrafted delicacies served with heart.</p>
          </div>
        </>
      )}
    </div>
  );
}
