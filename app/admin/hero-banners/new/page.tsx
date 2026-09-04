import { HeroBannerForm } from "@/components/admin/hero-banner-form";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";

export default function NewHeroBannerPage() {
  return (
    <>
      <PageHeader
        description="Add a new full-bleed image or video hero slide to the storefront home page."
        eyebrow="CONTENT"
        title="Add Hero Banner"
      />

      <Card className="p-6 sm:p-8 shadow-xs max-w-4xl">
        <HeroBannerForm />
      </Card>
    </>
  );
}
