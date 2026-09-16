import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { RestrictedLocationsEditor } from "@/components/admin/restricted-locations-editor";
import { getRestrictedLocations } from "@/lib/delivery/restricted-locations";

export const instant = false;

export default async function StoreSettingsPage() {
  await connection();
  const initialLocations = await getRestrictedLocations();

  return (
    <>
      <PageHeader
        description="Manage store-wide delivery boundaries, restricted product locations, and operational parameters."
        eyebrow="OPERATIONS"
        title="Store Settings"
      />

      <RestrictedLocationsEditor initialLocations={initialLocations} />
    </>
  );
}
