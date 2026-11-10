import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { ShippingManager } from "@/components/admin/shipping-manager";
import { getAllStatesWithShippingStatus, getBangaloreShippingConfig } from "@/lib/shipping/rules";
import { getBengaluruPincodeConfigs } from "@/lib/delivery/bengaluru-pincodes";
import { requireAdmin } from "@/lib/auth/admin";

export const instant = false;

export default async function AdminShippingPage() {
  await connection();
  await requireAdmin();

  const [states, bangaloreConfig, bengaluruPincodes] = await Promise.all([
    getAllStatesWithShippingStatus(),
    getBangaloreShippingConfig(),
    getBengaluruPincodeConfigs(),
  ]);

  return (
    <>
      <PageHeader
        description="Configure dynamic, authoritative delivery charges for all 28 Indian States, 8 Union Territories, and dedicated Bengaluru Special Delivery coverage with PIN-specific rates."
        eyebrow="OPERATIONS"
        title="Shipping & Delivery Rates"
      />

      <ShippingManager
        initialStates={states}
        initialBangaloreConfig={bangaloreConfig}
        initialBengaluruPincodes={bengaluruPincodes}
      />
    </>
  );
}
