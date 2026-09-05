import Link from "next/link";
import { Plus, ArrowUp, ArrowDown, Edit3, Image as ImageIcon, Video, Film } from "lucide-react";
import { deleteHeroBanner, moveHeroBanner, toggleHeroBannerActive } from "@/actions/admin";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHeroImageUrl, getHeroVideoPosterUrl } from "@/lib/cloudinary/delivery";
import { getAdminHeroBanners } from "@/lib/storefront/hero";

export default async function HeroBannersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const banners = await getAdminHeroBanners();
  const q = await searchParams;

  return (
    <>
      <PageHeader
        description="Manage full-bleed storefront hero sliders, background image/video media, and CTA overlays."
        eyebrow="CONTENT"
        title="Hero Banners"
        action={
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            href="/admin/hero-banners/new"
          >
            <Plus size={16} /> Add Hero Banner
          </Link>
        }
      />

      {q.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {q.error}
        </div>
      )}

      <Card className="overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/60 text-xs font-bold tracking-wider uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5 w-16">Order</th>
                <th className="px-5 py-3.5 w-32">Media</th>
                <th className="px-5 py-3.5">Banner Content</th>
                <th className="px-5 py-3.5 w-28">Type</th>
                <th className="px-5 py-3.5 w-28">Status</th>
                <th className="px-5 py-3.5 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.map((banner, index) => {
                const isPosterFromVideo =
                  banner.media_type === "video" &&
                  (!banner.poster_public_id || banner.poster_public_id === banner.cloudinary_public_id);

                const thumbnailUrl = isPosterFromVideo
                  ? getHeroVideoPosterUrl(banner.cloudinary_public_id, "thumbnail")
                  : banner.poster_public_id
                  ? getHeroImageUrl(banner.poster_public_id, "thumbnail")
                  : banner.media_type === "image"
                  ? getHeroImageUrl(banner.cloudinary_public_id, "thumbnail")
                  : null;

                return (
                  <tr key={banner.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-muted-foreground">
                      {String(banner.display_order).padStart(2, "0")}
                    </td>

                    <td className="px-5 py-4">
                      <div className="relative h-16 w-24 overflow-hidden rounded-lg border border-border bg-secondary/50 flex items-center justify-center">
                        {thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={banner.headline}
                            className="h-full w-full object-cover"
                            src={thumbnailUrl}
                          />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            <Film size={20} />
                            <span className="text-[10px] mt-0.5">Video</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                        {banner.eyebrow}
                      </p>
                      <p className="font-semibold text-foreground line-clamp-1 mt-0.5">
                        {banner.headline.replace(/\n/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-lg">
                        {banner.description}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground">
                        {banner.media_type === "video" ? <Video className="text-accent" size={14} /> : <ImageIcon className="text-primary" size={14} />}
                        <span className="capitalize">{banner.media_type}</span>
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <form action={toggleHeroBannerActive}>
                        <input name="id" type="hidden" value={banner.id} />
                        <input name="is_active" type="hidden" value={banner.is_active ? "false" : "true"} />
                        <button type="submit" className="cursor-pointer">
                          <StatusBadge status={banner.is_active ? "active" : "inactive"} />
                        </button>
                      </form>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reorder Buttons */}
                        <form action={moveHeroBanner}>
                          <input name="id" type="hidden" value={banner.id} />
                          <input name="direction" type="hidden" value="up" />
                          <Button disabled={index === 0} size="icon" type="submit" variant="ghost" className="h-8 w-8">
                            <ArrowUp size={14} />
                          </Button>
                        </form>

                        <form action={moveHeroBanner}>
                          <input name="id" type="hidden" value={banner.id} />
                          <input name="direction" type="hidden" value="down" />
                          <Button disabled={index === banners.length - 1} size="icon" type="submit" variant="ghost" className="h-8 w-8">
                            <ArrowDown size={14} />
                          </Button>
                        </form>

                        {/* Edit Button */}
                        <Link
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground hover:bg-secondary transition-colors"
                          href={`/admin/hero-banners/${banner.id}`}
                        >
                          <Edit3 size={15} />
                        </Link>

                        {/* Delete Dialog */}
                        <ConfirmDialog
                          action={deleteHeroBanner}
                          confirmLabel="Delete"
                          description={`Remove hero banner "${banner.headline.slice(0, 30)}..."? Old Cloudinary assets will be cleaned up.`}
                          hiddenFields={{ id: banner.id }}
                          title="Delete hero banner?"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {banners.length === 0 && (
            <EmptyState
              description="Create your first hero banner with custom image or video background to feature on the storefront."
              title="No hero banners configured yet"
            />
          )}
        </div>
      </Card>
    </>
  );
}
