import { connection } from "next/server";
import { PageHeader } from "@/components/admin/page-header";
import { ShippingManager } from "@/components/admin/shipping-manager";
import { getAllStatesWithShippingStatus } from "@/lib/shipping/rules";
import { requireAdmin } from "@/lib/auth/admin";

export const instant = false;

export default async function AdminShippingPage() {
  await connection();
  await requireAdmin();

  const states = await getAllStatesWithShippingStatus();

  return (
    <>
      <PageHeader
        description="Configure dynamic, authoritative delivery charges for all 28 Indian States and 8 Union Territories. Delivery is automatically blocked for states without an active rule."
        eyebrow="OPERATIONS"
        title="Shipping & Delivery Rates"
      />

      <ShippingManager initialStates={states} />
    </>
  );
}
