import { notFound } from "next/navigation";
import { HeroBannerForm } from "@/components/admin/hero-banner-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { getCloudinaryCloudName } from "@/lib/env/server";
import { getHeroBannerById } from "@/lib/storefront/hero";

export default async function EditHeroBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await getHeroBannerById(id);

  if (!banner) {
    notFound();
  }

  const cloudName = getCloudinaryCloudName();

  return (
    <>
      <PageHeader
        description="Update banner content, media, call-to-actions, and display settings."
        eyebrow="CONTENT"
        title="Edit Hero Banner"
      />

      <Card className="p-6 sm:p-8 shadow-xs max-w-4xl">
        <HeroBannerForm banner={banner} cloudName={cloudName} />
      </Card>
    </>
  );
}
