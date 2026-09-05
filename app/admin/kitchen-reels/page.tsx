import { getFromOurKitchenContent } from "@/lib/storefront/content";
import { PageHeader } from "@/components/admin/page-header";
import { KitchenReelsManager } from "./kitchen-reels-manager";

export const dynamic = "force-dynamic";

export default async function KitchenReelsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [content, params] = await Promise.all([
    getFromOurKitchenContent(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Content" },
          { label: "Instagram Reels" },
        ]}
        description="Manage behind-the-scenes Instagram reel videos showcased on the storefront homepage."
        eyebrow="CONTENT"
        title="Instagram Reels"
      />

      {params.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-900/20 bg-red-900/5 p-4 text-sm font-medium text-red-900 flex items-center justify-between"
        >
          <span>{params.error}</span>
        </div>
      )}

      {params.success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-900/20 bg-emerald-900/5 p-4 text-sm font-medium text-emerald-900 flex items-center justify-between"
        >
          <span>{params.success}</span>
        </div>
      )}

      <KitchenReelsManager initialData={content} />
    </div>
  );
}
