import "server-only";

import { renderCustomerOrderEmail } from "./templates/customer-order-email";
import { renderAdminOrderEmail } from "./templates/admin-order-email";
import { OrderEmailData } from "./types";
import { getOrderMetadata, saveOrderMetadata } from "@/lib/orders/metadata";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ADMIN_EMAIL = "namaste@nammaada.com";
const DEFAULT_SENDER_EMAIL = "namaste@nammaada.com";
const DEFAULT_SENDER_NAME = "Namma Ada";

async function getBrevoConfig() {
  const envKey = process.env.BREVO_API_KEY?.trim();
  const envSender = process.env.BREVO_SENDER_EMAIL?.trim();
  const envSenderName = process.env.BREVO_SENDER_NAME?.trim();
  const envAdmin = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();

  if (envKey) {
    return {
      apiKey: envKey,
      senderEmail: envSender || DEFAULT_SENDER_EMAIL,
      senderName: envSenderName || DEFAULT_SENDER_NAME,
      adminEmail: envAdmin || DEFAULT_ADMIN_EMAIL,
    };
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "brevo_config")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      const v = data.value as Record<string, string>;
      return {
        apiKey: v.apiKey || "",
        senderEmail: envSender || v.senderEmail || DEFAULT_SENDER_EMAIL,
        senderName: envSenderName || v.senderName || DEFAULT_SENDER_NAME,
        adminEmail: envAdmin || v.adminEmail || DEFAULT_ADMIN_EMAIL,
      };
    }
  } catch (err) {
    console.warn("[Brevo Email] Could not fetch brevo_config from DB:", err);
  }

  return {
    apiKey: "",
    senderEmail: envSender || DEFAULT_SENDER_EMAIL,
    senderName: envSenderName || DEFAULT_SENDER_NAME,
    adminEmail: envAdmin || DEFAULT_ADMIN_EMAIL,
  };
}

export type SendEmailResult = {
  customerSent: boolean;
  adminSent: boolean;
  error?: string;
};

/**
 * Low-level function to send a transactional email via Brevo v3 REST API.
 * Uses native fetch for edge/serverless speed, zero third-party SDK bloat.
 */
async function sendBrevoEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
}: {
  toEmail: string;
  toName?: string;
  subject: string;
  htmlContent: string;
}): Promise<boolean> {
  const config = await getBrevoConfig();

  if (!config.apiKey) {
    console.info(`[Brevo Email] BREVO_API_KEY not configured. Skipping live delivery to ${toEmail} ("${subject}")`);
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": config.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: config.senderName,
          email: config.senderEmail,
        },
        replyTo: {
          name: config.senderName,
          email: config.senderEmail || DEFAULT_SENDER_EMAIL,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail,
          },
        ],
        subject,
        htmlContent,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Brevo Email] Dispatch failed (${response.status}) to ${toEmail}:`, errText);
      return false;
    }

    const data = (await response.json()) as { messageId?: string };
    console.info(`[Brevo Email] Order notification successfully sent to ${toEmail} (MessageId: ${data.messageId || "ok"})`);
    return true;
  } catch (error) {
    console.error(`[Brevo Email] Network exception sending to ${toEmail}:`, error);
    return false;
  }
}

/**
 * Sends Customer Paid Order Confirmation via Brevo
 */
export async function sendCustomerPaidOrderEmail(data: OrderEmailData): Promise<boolean> {
  if (!data.customerEmail || !data.customerEmail.includes("@")) {
    return false;
  }

  const subject = `Namma Ada — Payment Successful & Order Confirmed #${data.orderNumber}`;
  const htmlContent = renderCustomerOrderEmail({
    ...data,
    paymentMethod: "ONLINE",
    paymentStatus: "paid",
  });

  return sendBrevoEmail({
    toEmail: data.customerEmail,
    toName: data.customerName,
    subject,
    htmlContent,
  });
}

/**
 * Sends Customer COD Order Confirmation via Brevo
 */
export async function sendCustomerCodOrderEmail(data: OrderEmailData): Promise<boolean> {
  if (!data.customerEmail || !data.customerEmail.includes("@")) {
    return false;
  }

  const subject = `Namma Ada — Order Received #${data.orderNumber}`;
  const htmlContent = renderCustomerOrderEmail({
    ...data,
    paymentMethod: "COD",
    paymentStatus: "pending",
  });

  return sendBrevoEmail({
    toEmail: data.customerEmail,
    toName: data.customerName,
    subject,
    htmlContent,
  });
}

/**
 * Sends Admin Notification for Paid Order via Brevo to namaste@nammaada.com
 */
export async function sendAdminPaidOrderEmail(data: OrderEmailData): Promise<boolean> {
  const config = await getBrevoConfig();
  const subject = `Namma Ada — New PAID Order #${data.orderNumber}`;
  const htmlContent = renderAdminOrderEmail({
    ...data,
    paymentMethod: "ONLINE",
    paymentStatus: "paid",
  });

  return sendBrevoEmail({
    toEmail: config.adminEmail,
    toName: "Namma Ada Admin",
    subject,
    htmlContent,
  });
}

/**
 * Sends Admin Notification for COD Order via Brevo to namaste@nammaada.com
 */
export async function sendAdminCodOrderEmail(data: OrderEmailData): Promise<boolean> {
  const config = await getBrevoConfig();
  const subject = `Namma Ada — New COD Order #${data.orderNumber}`;
  const htmlContent = renderAdminOrderEmail({
    ...data,
    paymentMethod: "COD",
    paymentStatus: "pending",
  });

  return sendBrevoEmail({
    toEmail: config.adminEmail,
    toName: "Namma Ada Admin",
    subject,
    htmlContent,
  });
}

/**
 * Dispatches both customer and admin order emails through Brevo with duplicate protection.
 * Safe, non-blocking: Checkout never fails if email sending has an issue.
 */
export async function sendOrderConfirmationEmails(data: OrderEmailData): Promise<SendEmailResult> {
  const isCod = data.paymentMethod === "COD" || data.paymentStatus === "pending";

  // Duplicate email protection via Order Metadata idempotency
  let customerAlreadySent = false;
  let adminAlreadySent = false;
  let existingMeta = null;

  if (data.orderId) {
    try {
      existingMeta = await getOrderMetadata(data.orderId);
      if (existingMeta?.customerEmailSent) customerAlreadySent = true;
      if (existingMeta?.adminEmailSent) adminAlreadySent = true;
    } catch (metaErr) {
      console.warn("[Brevo Email] Could not check order email metadata:", metaErr);
    }
  }

  let customerSent = false;
  let adminSent = false;

  // 1. Send customer email if not already sent
  if (!customerAlreadySent && data.customerEmail && data.customerEmail.includes("@")) {
    customerSent = isCod
      ? await sendCustomerCodOrderEmail(data)
      : await sendCustomerPaidOrderEmail(data);
  } else if (customerAlreadySent) {
    console.info(`[Brevo Email] Customer email already sent for order #${data.orderNumber}. Skipping duplicate.`);
    customerSent = true;
  }

  // 2. Send admin email if not already sent
  if (!adminAlreadySent) {
    adminSent = isCod
      ? await sendAdminCodOrderEmail(data)
      : await sendAdminPaidOrderEmail(data);
  } else {
    console.info(`[Brevo Email] Admin email already sent for order #${data.orderNumber}. Skipping duplicate.`);
    adminSent = true;
  }

  // Record sent status in order metadata for persistent duplicate protection
  if (data.orderId && (customerSent || adminSent)) {
    try {
      await saveOrderMetadata({
        orderId: data.orderId,
        paymentMethod: isCod ? "COD" : "RAZORPAY",
        itemsDeliveryType: existingMeta?.itemsDeliveryType || {},
        customerEmailSent: customerAlreadySent || customerSent,
        adminEmailSent: adminAlreadySent || adminSent,
      });
    } catch (saveErr) {
      console.error("[Brevo Email] Failed to update email sent metadata:", saveErr);
    }
  }

  return { customerSent, adminSent };
}
