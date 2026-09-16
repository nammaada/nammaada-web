import { OrderEmailData } from "../types";

function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function renderCustomerOrderEmail(data: OrderEmailData): string {
  const isCod = data.paymentMethod === "COD" || data.paymentStatus === "pending";
  const baseUrl = data.siteUrl || process.env.NEXT_PUBLIC_APP_URL || "https://nammaada.com";
  const viewOrderUrl = `${baseUrl.replace(/\/+$/, "")}/order-success/${encodeURIComponent(data.orderNumber)}`;
  const whatsappUrl = `https://wa.me/919995811622?text=Hi%20Namma%20Ada,%20I%20have%20a%20question%20regarding%20my%20order%20%23${encodeURIComponent(data.orderNumber)}`;

  const logoUrl = "https://res.cloudinary.com/htzxecwe/image/upload/v1789553679/namma_ada_email_logo.png";

  const itemsRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eedec8; vertical-align: top;">
          <div style="font-size: 14px; font-weight: 600; color: #2b1719; line-height: 1.3;">
            ${item.name}
          </div>
          ${
            item.variantName
              ? `<div style="font-size: 12px; color: #6e5b55; margin-top: 2px;">${item.variantName}</div>`
              : ""
          }
          <div style="font-size: 12px; color: #6e5b55; margin-top: 4px;">
            Qty: <span style="font-weight: 600; color: #2b1719;">${item.quantity}</span> × ${formatINR(item.unitPricePaise)}
          </div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eedec8; text-align: right; vertical-align: top; font-size: 14px; font-weight: 700; color: #711e2c; white-space: nowrap;">
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
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${isCod ? `Namma Ada — Order Received #${data.orderNumber}` : `Namma Ada — Payment Successful & Order Confirmed #${data.orderNumber}`}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
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
      .mobile-btn { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 10px !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f7f3ed;">
  <center style="width: 100%; background-color: #f7f3ed;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      
      <!-- TOP LOGO HEADER -->
      <tr>
        <td align="center" style="padding: 24px 20px 20px; background-color: #ffffff; border-top-left-radius: 20px; border-top-right-radius: 20px; border: 1px solid #eedec8; border-bottom: none;">
          <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
            <img src="${logoUrl}" alt="Namma Ada" width="180" style="display: block; width: 180px; max-width: 100%; height: auto; margin: 0 auto; border: 0;" />
          </a>
        </td>
      </tr>

      <!-- CELEBRATION HERO SECTION -->
      <tr>
        <td class="fluid-padding" style="padding: 10px 32px 28px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8; text-align: center;">
          ${
            isCod
              ? `
              <!-- COD Icon & Eyebrow -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px;">
                <tr>
                  <td align="center" style="width: 56px; height: 56px; background-color: #fef3c7; border: 2px solid #fde68a; border-radius: 50%; font-size: 26px; line-height: 56px; color: #b45309; text-align: center;">
                    ✓
                  </td>
                </tr>
              </table>
              <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #b45309; margin-bottom: 6px;">
                ORDER RECEIVED
              </div>
              <h1 style="margin: 0 0 10px; font-size: 26px; font-weight: 700; color: #2b1719; font-family: Georgia, 'Times New Roman', serif;">
                Thank You for Your Order!
              </h1>
              <p style="margin: 0 auto; max-width: 440px; font-size: 14px; line-height: 1.5; color: #6e5b55;">
                Your order has been successfully received. Your delicacies are being carefully prepared with authentic tradition.
              </p>
              `
              : `
              <!-- Paid Icon & Eyebrow -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px;">
                <tr>
                  <td align="center" style="width: 56px; height: 56px; background-color: #d1fae5; border: 2px solid #a7f3d0; border-radius: 50%; font-size: 26px; line-height: 56px; color: #047857; text-align: center;">
                    ✓
                  </td>
                </tr>
              </table>
              <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #047857; margin-bottom: 6px;">
                PAYMENT SUCCESSFUL
              </div>
              <h1 style="margin: 0 0 10px; font-size: 26px; font-weight: 700; color: #2b1719; font-family: Georgia, 'Times New Roman', serif;">
                Thank You for Your Order!
              </h1>
              <p style="margin: 0 auto; max-width: 440px; font-size: 14px; line-height: 1.5; color: #6e5b55;">
                Your payment has been successfully received and your order has been confirmed. Your delicacies are being carefully prepared with authentic tradition.
              </p>
              `
          }
        </td>
      </tr>

      <!-- ORDER REFERENCE & PAYMENT CARD -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf6f0; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #6e5b55; margin-bottom: 2px;">
                  ORDER REFERENCE
                </div>
                <div style="font-size: 20px; font-weight: 700; font-family: monospace, Courier, sans-serif; color: #711e2c; margin-bottom: 12px;">
                  #${data.orderNumber}
                </div>

                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px dashed #eedec8; padding-top: 10px;">
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 4px; width: 45%;">Payment Method:</td>
                    <td style="font-size: 13px; font-weight: 700; color: #2b1719; padding-bottom: 4px;">
                      ${isCod ? "Cash on Delivery" : "Razorpay"}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 4px;">Payment Status:</td>
                    <td style="font-size: 13px; font-weight: 700; padding-bottom: 4px;">
                      ${
                        isCod
                          ? '<span style="color: #b45309; background-color: #fef3c7; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; font-size: 11px;">PENDING</span>'
                          : '<span style="color: #047857; background-color: #d1fae5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; font-size: 11px;">PAID</span>'
                      }
                    </td>
                  </tr>
                  ${
                    !isCod && data.razorpayPaymentId
                      ? `
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 4px;">Razorpay Payment ID:</td>
                    <td style="font-size: 12px; font-family: monospace; color: #2b1719; padding-bottom: 4px;">
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
                    <td style="font-size: 12px; color: #6e5b55; padding-bottom: 4px;">Amount Due on Delivery:</td>
                    <td style="font-size: 14px; font-weight: 800; color: #711e2c; font-family: Georgia, serif; padding-bottom: 4px;">
                      ${formatINR(data.totalAmountPaise)}
                    </td>
                  </tr>
                  `
                      : ""
                  }
                  <tr>
                    <td style="font-size: 12px; color: #6e5b55;">Order Status:</td>
                    <td style="font-size: 12px; font-weight: 700; color: ${isCod ? "#b45309" : "#047857"};">
                      ${data.orderStatus ? data.orderStatus.toUpperCase() : (isCod ? "PENDING" : "CONFIRMED")}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${
        isCod
          ? `
      <!-- COD PENDING PAYMENT NOTICE -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px;">
                <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 4px;">
                  ⚠️ CASH ON DELIVERY • PAYMENT PENDING
                </div>
                <div style="font-size: 13px; line-height: 1.4; color: #78350f;">
                  Payment has <strong>not</strong> been completed yet. Please keep <span style="font-weight: 700; color: #711e2c; font-size: 14px;">${formatINR(data.totalAmountPaise)}</span> in cash ready to hand over to our delivery executive upon arrival.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ""
      }

      <!-- ITEMS ORDERED CARD -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 18px 20px 8px;">
                <div style="font-size: 16px; font-weight: 700; color: #2b1719; font-family: Georgia, 'Times New Roman', serif; border-bottom: 1px solid #eedec8; padding-bottom: 10px;">
                  📦 Items Ordered (${data.items.length})
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${itemsRows}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ORDER SUMMARY CARD -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 18px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf6f0; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 18px 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 13px; color: #6e5b55; padding-bottom: 8px;">Subtotal</td>
                    <td align="right" style="font-size: 13px; font-weight: 600; color: #2b1719; padding-bottom: 8px;">
                      ${formatINR(data.subtotalPaise)}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #6e5b55; padding-bottom: 12px;">Shipping Fee</td>
                    <td align="right" style="font-size: 13px; font-weight: 600; color: #2b1719; padding-bottom: 12px;">
                      ${data.shippingFeePaise === 0 ? '<span style="color: #047857; font-weight: 700;">Free</span>' : formatINR(data.shippingFeePaise)}
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top: 1px solid #eedec8; padding-top: 12px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="font-size: 15px; font-weight: 700; color: #2b1719;">
                            ${isCod ? "Amount Due on Delivery" : "Total Paid"}
                          </td>
                          <td align="right" style="font-size: 20px; font-weight: 800; color: #711e2c; font-family: Georgia, 'Times New Roman', serif;">
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
        data.customerName || data.deliveryAddress || data.deliveryDistrictCity || data.customerPhone || data.customerEmail
          ? `
      <!-- DELIVERY DESTINATION CARD -->
      <tr>
        <td class="fluid-padding" style="padding: 0 32px 24px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #eedec8; border-radius: 12px;">
            <tr>
              <td style="padding: 18px 20px;">
                <div style="font-size: 16px; font-weight: 700; color: #2b1719; font-family: Georgia, 'Times New Roman', serif; margin-bottom: 10px;">
                  📍 Delivery Destination
                </div>
                ${data.customerName ? `<div style="font-size: 14px; font-weight: 700; color: #2b1719; margin-bottom: 4px;">${data.customerName}</div>` : ""}
                ${
                  data.deliveryAddress || data.deliveryDistrictCity || data.deliveryState || data.deliveryPincode
                    ? `<div style="font-size: 13px; line-height: 1.5; color: #6e5b55; margin-bottom: 8px;">
                        ${data.deliveryAddress ? `${data.deliveryAddress.replace(/\r?\n/g, "<br />")}<br />` : ""}
                        ${[data.deliveryDistrictCity, data.deliveryState, data.deliveryCountry || "India"].filter(Boolean).join(", ")}${data.deliveryPincode ? ` - <strong>${data.deliveryPincode}</strong>` : ""}
                      </div>`
                    : ""
                }
                ${
                  data.customerPhone || data.customerEmail
                    ? `<div style="font-size: 13px; color: #2b1719; margin-top: 8px; border-top: 1px dashed #eedec8; padding-top: 8px;">
                        ${data.customerPhone ? `📞 <strong>Phone:</strong> ${data.customerPhone}` : ""}
                        ${data.customerPhone && data.customerEmail ? "<br />" : ""}
                        ${data.customerEmail ? `✉️ <strong>Email:</strong> ${data.customerEmail}` : ""}
                      </div>`
                    : ""
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `
          : ""
      }

      <!-- ACTION BUTTONS -->
      <tr>
        <td class="fluid-padding" align="center" style="padding: 0 32px 30px; background-color: #ffffff; border-left: 1px solid #eedec8; border-right: 1px solid #eedec8;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
            <tr>
              <td class="mobile-btn" style="padding: 0 6px;">
                <a href="${viewOrderUrl}" target="_blank" style="display: inline-block; background-color: #711e2c; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 25px; text-align: center; box-shadow: 0 2px 4px rgba(113,30,44,0.15);">
                  View My Order →
                </a>
              </td>
              <td class="mobile-btn" style="padding: 0 6px;">
                <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #ecfdf5; border: 1px solid #86efac; color: #166534; font-size: 14px; font-weight: 700; text-decoration: none; padding: 11px 22px; border-radius: 25px; text-align: center;">
                  Need Help? Chat on WhatsApp
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BRAND FOOTER -->
      <tr>
        <td class="fluid-padding" align="center" style="padding: 24px 32px; background-color: #faf6f0; border: 1px solid #eedec8; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; text-align: center;">
          <div style="font-size: 14px; font-weight: 800; letter-spacing: 1.5px; color: #711e2c; text-transform: uppercase;">
            NAMMA ADA
          </div>
          <div style="font-size: 12px; color: #6e5b55; margin-top: 4px; margin-bottom: 12px;">
            Authentic Kerala delicacies, made with tradition ❤️
          </div>
          <div style="font-size: 12px; color: #6e5b55; margin-bottom: 8px;">
            Need help with your order? <a href="${whatsappUrl}" target="_blank" style="color: #711e2c; font-weight: 600; text-decoration: underline;">Chat with us on WhatsApp</a>
          </div>
          <div style="font-size: 11px; color: #9c8b85;">
            © ${new Date().getFullYear()} Namma Ada. All rights reserved.
          </div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;
}
