import "server-only";

export type WhatsAppOrderItem = {
  name: string;
  variantName?: string | null;
  quantity: number;
  unitPricePaise: number;
};

export type SendOrderWhatsAppParams = {
  phone: string;
  orderNumber: string;
  totalAmountPaise: number;
  items: WhatsAppOrderItem[];
};

/**
 * Clean phone number to E.164 without plus sign for WhatsApp Cloud API (e.g. 919995811622)
 */
function sanitizePhoneNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // If 10 digits Indian number (e.g. 9995811622), prepend India country code 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/**
 * Sends a structured WhatsApp order confirmation to the customer's phone
 * via Meta WhatsApp Cloud API.
 * Fails safely if credentials are not yet configured.
 */
export async function sendOrderConfirmationWhatsApp({
  phone,
  orderNumber,
  totalAmountPaise,
  items,
}: SendOrderWhatsAppParams): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (!accessToken || !phoneNumberId) {
    console.info(
      `[WhatsApp] WhatsApp credentials not configured. Skipping confirmation for order ${orderNumber}.`
    );
    return false;
  }

  const recipient = sanitizePhoneNumber(phone);
  if (!recipient || recipient.length < 10) {
    console.warn(`[WhatsApp] Invalid recipient phone number "${phone}" for order ${orderNumber}.`);
    return false;
  }

  const itemsListText = items
    .map(
      (item) =>
        `• ${item.name}${item.variantName ? ` (${item.variantName})` : ""} × ${item.quantity}`
    )
    .join("\n");

  const messageText = `*Thank you for your order!* 🌾

Your order has been successfully received.

*Order ID:* #${orderNumber}
*Amount:* ${formatINR(totalAmountPaise)}

*Items:*
${itemsListText}

We will process your order shortly and deliver fresh delicacies to you.

Thank you for choosing *Namma Ada*! ✨`;

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "text",
        text: {
          preview_url: false,
          body: messageText,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[WhatsApp] Cloud API message dispatch error:", response.status, err);
      return false;
    }

    console.info(`[WhatsApp] Order confirmation successfully sent to ${recipient} for order #${orderNumber}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Network exception during message dispatch:", error);
    return false;
  }
}
