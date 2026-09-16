import { OrderEmailData } from "../types";

function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function renderAdminOrderEmail(data: OrderEmailData): string {
  const isCod = data.paymentMethod === "COD" || data.paymentStatus === "pending";
  const baseUrl = data.siteUrl || process.env.NEXT_PUBLIC_APP_URL || "https://nammaada.com";
  const adminOrderUrl = `${baseUrl.replace(/\/+$/, "")}/admin/orders/${data.orderId || ""}`;
  const orderDate = data.orderDate || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const logoUrl = "https://res.cloudinary.com/htzxecwe/image/upload/v1789553679/namma_ada_email_logo.png";

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eedec8; vertical-align: top;">
          <div style="font-size: 13px; font-weight: 600; color: #2b1719;">
            ${item.name}
          </div>
          ${
            item.variantName
              ? `<div style="font-size: 11px; color: #6e5b55; margin-top: 2px;">${item.variantName}</div>`
              : ""
          }
          <div style="font-size: 11px; color: #6e5b55; margin-top: 2px;">
            Qty: <strong>${item.quantity}</strong> × ${formatINR(item.unitPricePaise)}
          </div>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eedec8; text-align: right; vertical-align: top; font-size: 13px; font-weight: 700; color: #711e2c; white-space: nowrap;">
          ${formatINR(item.lineTotalPaise)}
        </td>
      </tr>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isCod ? `Namma Ada — New COD Order #${data.orderNumber}` : `Namma Ada — New PAID Order #${data.orderNumber}`}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f7f3ed; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f7f3ed;">
  <center style="width: 100%; background-color: #f7f3ed;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      
      <!-- BRAND HEADER -->
      <tr>
        <td align="center" style="padding: 24px 20px 16px; background-color: #ffffff; border-top-left-radius: 20px; border-top-right-radius: 20px; border: 1px solid #eedec8; border-bottom: none;">
          <img src="${logoUrl}" alt="Namma Ada" width="160" style="display: block; width: 160px; max-width: 100%; height: auto; margin: 0 auto; border: 0;" />
          <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #711e2c; margin-top: 10px;">
            ADMIN ORDER NOTIFICATION
          </div>
        </td>
      </tr>

      <!-- NOTIFICATION HERO BANNER -->
      <tr>
        <td class="fluid-padding" style="padding: 10px 32px 20px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8; text-align: center;">
          ${
            isCod
              ? `
              <div style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 24px; padding: 6px 18px; font-size: 13px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">
                🔔 NEW COD ORDER
              </div>
              <h2 style="margin: 12px 0 4px; font-size: 22px; font-weight: 700; color: #2b1719; font-family: Georgia, 'Times New Roman', serif;">
                Order #${data.orderNumber}
              </h2>
              <p style="margin: 0; font-size: 13px; color: #6e5b55;">
                A new Cash on Delivery order has been placed and requires processing.
              </p>
              `
              : `
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 24px; padding: 6px 18px; font-size: 13px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.5px;">
                🔔 NEW PAID ORDER
              </div>
              <h2 style="margin: 12px 0 4px; font-size: 22px; font-weight: 700; color: #2b1719; font-family: Georgia, 'Times New Roman', serif;">
                Order #${data.orderNumber}
              </h2>
              <p style="margin: 0; font-size: 13px; color: #6e5b55;">
                Payment has been successfully received via Razorpay.
              </p>
              `
          }
        </td>
      </tr>

      <!-- ORDER INFORMATION CARD -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf6f0; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 18px 20px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #711e2c; margin-bottom: 10px; border-bottom: 1px solid #eedec8; padding-bottom: 6px;">
                  ORDER & PAYMENT INFORMATION
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px; width: 40%;">Order ID</td>
                    <td style="font-size: 13px; font-weight: 700; font-family: monospace; color: #711e2c; padding-bottom: 6px;">
                      #${data.orderNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Order Date</td>
                    <td style="font-size: 13px; color: #2b1719; padding-bottom: 6px;">
                      ${orderDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Order Status</td>
                    <td style="font-size: 13px; font-weight: 700; color: ${isCod ? "#b45309" : "#047857"}; padding-bottom: 6px;">
                      ${data.orderStatus ? data.orderStatus.toUpperCase() : (isCod ? "PENDING" : "CONFIRMED")}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Payment Method</td>
                    <td style="font-size: 13px; font-weight: 700; color: #2b1719; padding-bottom: 6px;">
                      ${isCod ? "Cash on Delivery" : "Razorpay"}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Payment Status</td>
                    <td style="font-size: 13px; font-weight: 700; padding-bottom: 6px;">
                      ${
                        isCod
                          ? '<span style="color: #b45309; background-color: #fef3c7; padding: 2px 8px; border-radius: 4px; font-size: 11px; border: 1px solid #fde68a;">PENDING</span>'
                          : '<span style="color: #047857; background-color: #d1fae5; padding: 2px 8px; border-radius: 4px; font-size: 11px; border: 1px solid #a7f3d0;">PAID</span>'
                      }
                    </td>
                  </tr>
                  ${
                    data.razorpayPaymentId
                      ? `
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Razorpay Payment ID</td>
                    <td style="font-size: 12px; font-family: monospace; color: #2b1719; padding-bottom: 6px;">
                      ${data.razorpayPaymentId}
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  ${
                    isCod
                      ? `
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Amount to Collect</td>
                    <td style="font-size: 15px; font-weight: 800; color: #711e2c; font-family: Georgia, serif; padding-bottom: 6px;">
                      ${formatINR(data.totalAmountPaise)}
                    </td>
                  </tr>
                  `
                      : `
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Amount Paid</td>
                    <td style="font-size: 15px; font-weight: 800; color: #047857; font-family: Georgia, serif; padding-bottom: 6px;">
                      ${formatINR(data.totalAmountPaise)}
                    </td>
                  </tr>
                  `
                  }
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${
        data.customerName || data.customerPhone || data.customerEmail
          ? `
      <!-- CUSTOMER INFORMATION CARD -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px;">
                <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #711e2c; margin-bottom: 8px; border-bottom: 1px solid #eedec8; padding-bottom: 6px;">
                  CUSTOMER INFORMATION
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${
                    data.customerName
                      ? `
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 4px; width: 40%;">Customer Name:</td>
                    <td style="font-size: 13px; font-weight: 600; color: #2b1719; padding-bottom: 4px;">
                      ${data.customerName}
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  ${
                    data.customerPhone
                      ? `
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 4px;">Phone:</td>
                    <td style="font-size: 13px; font-weight: 600; color: #2b1719; padding-bottom: 4px;">
                      <a href="tel:${data.customerPhone}" style="color: #711e2c; text-decoration: none;">${data.customerPhone}</a>
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  ${
                    data.customerEmail
                      ? `
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55;">Email:</td>
                    <td style="font-size: 13px; color: #2b1719;">
                      <a href="mailto:${data.customerEmail}" style="color: #711e2c; text-decoration: none;">${data.customerEmail}</a>
                    </td>
                  </tr>
                  `
                      : ""
                  }
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ""
      }

      <!-- ORDER ITEMS -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 18px 20px 8px;">
                <div style="font-size: 15px; font-weight: 700; color: #2b1719; font-family: Georgia, serif; border-bottom: 1px solid #eedec8; padding-bottom: 8px;">
                  📦 Products Ordered (${data.items.length})
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${itemsRows}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- FINANCIAL TOTALS -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf6f0; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 6px;">Subtotal</td>
                    <td align="right" style="font-size: 12px; font-weight: 600; color: #2b1719; padding-bottom: 6px;">
                      ${formatINR(data.subtotalPaise)}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 8px;">Shipping</td>
                    <td align="right" style="font-size: 12px; font-weight: 600; color: #2b1719; padding-bottom: 8px;">
                      ${data.shippingFeePaise === 0 ? "Free" : formatINR(data.shippingFeePaise)}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top: 1px solid #eedec8; padding-top: 8px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 14px; font-weight: 700; color: #2b1719;">
                            ${isCod ? "Amount Due on Delivery" : "Total Paid"}
                          </td>
                          <td align="right" style="font-size: 18px; font-weight: 800; color: #711e2c; font-family: Georgia, serif;">
                            ${formatINR(data.totalAmountPaise)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${
        data.deliveryAddress || data.deliveryDistrictCity || data.deliveryState || data.deliveryPincode
          ? `
      <!-- DELIVERY INFORMATION -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 24px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px;">
                <div style="font-size: 14px; font-weight: 700; color: #2b1719; font-family: Georgia, serif; margin-bottom: 8px;">
                  📍 Delivery Information
                </div>
                <div style="font-size: 13px; line-height: 1.4; color: #2b1719;">
                  ${data.customerName ? `<strong>${data.customerName}</strong><br />` : ""}
                  ${data.deliveryAddress ? `${data.deliveryAddress.replace(/\r?\n/g, "<br />")}<br />` : ""}
                  ${[data.deliveryDistrictCity, data.deliveryState, data.deliveryCountry || "India"].filter(Boolean).join(", ")}${data.deliveryPincode ? ` - <strong>${data.deliveryPincode}</strong>` : ""}
                  ${data.customerPhone ? `<br />Phone: <strong>${data.customerPhone}</strong>` : ""}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ""
      }

      <!-- ADMIN ACTIONS -->
      <tr>
        <td class="fluid-padding" align="center" style="padding: 0 32px 28px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <a href="${adminOrderUrl}" target="_blank" style="display: inline-block; background-color: #711e2c; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 25px; text-align: center; box-shadow: 0 2px 4px rgba(113,30,44,0.15);">
            Open Order in Admin Panel →
          </a>
        </td>
      </tr>

      <!-- ADMIN FOOTER -->
      <tr>
        <td class="fluid-padding" align="center" style="padding: 20px 32px; background-color: #faf6f0; border: 1px solid #eedec8; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; text-align: center;">
          <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: #711e2c; text-transform: uppercase;">
            NAMMA ADA ADMIN
          </div>
          <div style="font-size: 11px; color: #6e5b55; margin-top: 4px;">
            Automated internal operational notification dispatched to namaste@nammaada.com
          </div>
          <div style="font-size: 11px; color: #9c8b85; margin-top: 4px;">
            © ${new Date().getFullYear()} Namma Ada. All rights reserved.
          </div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;
}
