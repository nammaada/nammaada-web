import { deleteHeroMedia } from "@/actions/admin";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHeroMediaConfig } from "@/lib/storefront/hero";
import { HeroMediaForm } from "@/components/admin/hero-media-form";

export default async function AdminHeroPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const config = await getHeroMediaConfig();
  const params = await searchParams;

  return (
    <>
      <PageHeader
        description="Configure the primary storefront hero media (Image or Video), poster fallback, and accessibility text."
        eyebrow="CONTENT"
        title="Hero banner media"
      />

      {params.error && (
        <div role="alert" className="mb-6 rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900">
          {params.error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] items-start">
        {/* Left Column: Media Form */}
        <Card className="p-6 sm:p-8 shadow-xs">
          <HeroMediaForm config={config} />
        </Card>

        {/* Right Column: Active Media Live Preview & Reset */}
        <div className="grid gap-6">
          <Card className="p-6 shadow-xs">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Live Media Preview</h2>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-secondary/40 shadow-inner flex items-center justify-center">
              {config.media_url ? (
                config.media_type === "video" ? (
                  <video
                    autoPlay
                    className="h-full w-full object-cover"
                    loop
                    muted
                    playsInline
                    poster={config.poster_url || undefined}
                    src={config.media_url}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={config.alt_text || "Hero media preview"}
                    className="h-full w-full object-cover"
                    src={config.media_url}
                  />
                )
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground italic">
                  No custom media uploaded yet. The storefront currently displays the default craft illustration.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Type:</span>
                <span className="font-semibold text-foreground uppercase tracking-wider">{config.media_type}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-medium">Alt Text:</span>
                <span className="font-medium text-foreground truncate max-w-[180px]">{config.alt_text || "Default"}</span>
              </div>
            </div>

            {config.media_url && (
              <div className="mt-6 pt-4 border-t border-border">
                <ConfirmDialog
                  action={deleteHeroMedia}
                  confirmLabel="Reset to default"
                  description="This will remove the custom hero image/video and reset to the default craft illustration."
                  title="Reset hero media?"
                  variant="destructive"
                  triggerBtn={
                    <Button variant="outline" size="sm" className="w-full text-red-800 hover:bg-red-50">
                      Reset media to default
                    </Button>
                  }
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
