"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type BulkEnquiryState = {
  success?: boolean;
  error?: string;
};

export async function submitBulkEnquiry(
  _prevState: BulkEnquiryState,
  formData: FormData
): Promise<BulkEnquiryState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const product_requirement = String(formData.get("product_requirement") ?? "").trim();
  const quantity_details = String(formData.get("quantity_details") ?? "").trim();

  if (!name) {
    return { error: "Please enter your name." };
  }
  if (!phone || phone.length < 7 || phone.length > 20) {
    return { error: "Please enter a valid phone number." };
  }
  if (!product_requirement) {
    return { error: "Please specify your product requirement." };
  }
  if (!quantity_details) {
    return { error: "Please provide quantity or details of your order." };
  }

  const client = createSupabaseAdminClient();
  const { error } = await client.from("bulk_enquiries").insert({
    name,
    phone,
    email,
    product_requirement,
    quantity_details,
    status: "new",
  });

  if (error) {
    console.error("Bulk enquiry submission error:", error);
    return { error: "Unable to submit enquiry right now. Please try again." };
  }

  revalidatePath("/admin/enquiries");
  return { success: true };
}
