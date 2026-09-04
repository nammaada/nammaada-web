import { getWhoWeAreContent } from "@/lib/storefront/content";
import { PageHeader } from "@/components/admin/page-header";
import { OurStoryForm } from "./our-story-form";

export const dynamic = "force-dynamic";

export default async function OurStoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const [content, params] = await Promise.all([
    getWhoWeAreContent(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Content" },
          { label: "Our Story" },
        ]}
        description="Edit the homepage Our Story section content and manage up to 3 large showcase photos."
        eyebrow="CONTENT"
        title="Our Story"
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

      <OurStoryForm initialData={content} />
    </div>
  );
}
