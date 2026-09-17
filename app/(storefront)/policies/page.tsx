import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PoliciesScrollHandler } from "@/components/policies/policies-scroll-handler";

export const metadata: Metadata = {
  title: "Policies | Namma Ada",
  description: "Official policies for Namma Ada: Return & Refund Policy, Shipping Policy, Terms & Conditions, and Privacy Policy.",
};

export default function PoliciesPage() {
  return (
    <div className="py-8 sm:py-14 lg:py-16">
      <PoliciesScrollHandler />
      <Container className="max-w-4xl mx-auto">
        {/* Main Editorial Glass Card */}
        <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-white/60 via-[#fcf7ee]/35 to-[#f5e8d5]/25 p-6 sm:p-10 lg:p-12 backdrop-blur-xl [transform:translateZ(0)] shadow-[0_16px_36px_-10px_rgba(43,23,25,0.08),inset_0_1px_1.5px_0_rgba(255,255,255,0.75)] space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b border-[#711e2c]/15">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#2b1719]">
              Policies
            </h1>
            
            {/* Quick Navigation Chips */}
            <nav aria-label="Policies quick navigation" className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Link
                href="#refund"
                className="inline-flex items-center rounded-full border border-[#711e2c]/20 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-[#711e2c] hover:bg-[#711e2c] hover:text-white transition-all shadow-2xs"
              >
                Return &amp; Refund Policy
              </Link>
              <Link
                href="#shipping"
                className="inline-flex items-center rounded-full border border-[#711e2c]/20 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-[#711e2c] hover:bg-[#711e2c] hover:text-white transition-all shadow-2xs"
              >
                Shipping Policy
              </Link>
              <Link
                href="#terms"
                className="inline-flex items-center rounded-full border border-[#711e2c]/20 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-[#711e2c] hover:bg-[#711e2c] hover:text-white transition-all shadow-2xs"
              >
                Terms &amp; Conditions
              </Link>
              <Link
                href="#privacy"
                className="inline-flex items-center rounded-full border border-[#711e2c]/20 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-[#711e2c] hover:bg-[#711e2c] hover:text-white transition-all shadow-2xs"
              >
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* 1. RETURN & REFUND POLICY */}
          <section id="refund" className="scroll-mt-28 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#711e2c] border-b border-[#711e2c]/15 pb-2">
              Return &amp; Refund Policy
            </h2>

            <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
              Welcome to Namma Ada. Every item is freshly prepared with care, and we want you to have the best experience.
            </p>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Returns
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                As we sell perishable food products, we do not accept returns once an order has been delivered.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Refunds &amp; Replacements
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                You are eligible for a replacement or refund if:
              </p>
              <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-[#5a4843]">
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>You receive the wrong item.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>The product is damaged or leaked during delivery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>The order is spoiled due to a delivery issue.</span>
                </li>
              </ul>

              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed pt-1">
                Please contact us within 2 hours of delivery with:
              </p>
              <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-[#5a4843]">
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Your order number.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Photos of the product.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>A brief description of the issue.</span>
                </li>
              </ul>

              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed pt-1">
                Approved refunds will be processed within 5–7 business days to the original payment method.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Order Cancellation
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Orders can be cancelled within 30 minutes of placing the order.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Once preparation begins, cancellations are not possible.
              </p>
            </div>
          </section>

          {/* 2. SHIPPING POLICY */}
          <section id="shipping" className="scroll-mt-28 space-y-6 pt-8 border-t border-[#711e2c]/15">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#711e2c] border-b border-[#711e2c]/15 pb-2">
              Shipping Policy
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Delivery Locations
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                We currently deliver across Bengaluru.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Delivery Days
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Wednesday to Sunday
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Delivery Charges
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Delivery charges are calculated based on your location and will be communicated during order confirmation.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Order Confirmation
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Orders are confirmed only through WhatsApp after payment or confirmation.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Delivery Time
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Fresh Palada Payasam: Delivered on the selected date and time slot.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Snacks &amp; other products: Usually delivered within 1–2 business days.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Storage Instructions
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                For Chill&apos;ada Palada Payasam:
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Keep refrigerated at 2°C–4°C.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Consume before the Use By date printed on the bottle.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Do not leave unrefrigerated for extended periods.
              </p>
            </div>
          </section>

          {/* 3. TERMS & CONDITIONS */}
          <section id="terms" className="scroll-mt-28 space-y-6 pt-8 border-t border-[#711e2c]/15">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#711e2c] border-b border-[#711e2c]/15 pb-2">
              Terms &amp; Conditions
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Welcome to Namma Ada
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                By placing an order through our website, you agree to the following terms.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Products
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                All products are freshly prepared.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Slight variations in taste, texture, or colour may occur due to natural ingredients.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Pricing
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Prices are listed in Indian Rupees (INR).
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Prices may change without prior notice.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Orders
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Orders are subject to availability.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                We reserve the right to decline or cancel an order if a product is unavailable.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Delivery
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Customers must provide the correct delivery address and phone number.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Delays due to weather, traffic, or unforeseen circumstances may occur.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Intellectual Property
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                The Namma Ada name, logo, images, and website content are the property of Namma Ada and may not be used without permission.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Contact
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                For any questions regarding orders or products, contact us through WhatsApp or the contact details provided on the website.
              </p>
            </div>
          </section>

          {/* 4. PRIVACY POLICY */}
          <section id="privacy" className="scroll-mt-28 space-y-6 pt-8 border-t border-[#711e2c]/15">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#711e2c] border-b border-[#711e2c]/15 pb-2">
              Privacy Policy
            </h2>

            <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
              At Namma Ada, we respect your privacy.
            </p>

            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Information We Collect
              </h3>
              <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-[#5a4843]">
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Phone number</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Email address (if provided)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Delivery address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Order details</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                How We Use Your Information
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                We use your information to:
              </p>
              <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-[#5a4843]">
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Confirm your orders.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Deliver your products.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Communicate order updates via WhatsApp or phone.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#711e2c] font-bold">•</span>
                  <span>Improve our services.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Data Protection
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                We do not sell or share your personal information with third parties except trusted delivery partners when required to complete your order.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Payments
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Payments are processed through secure payment providers.
              </p>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                Namma Ada does not store your card or banking details.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#2b1719]">
                Contact Us
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4843] leading-relaxed">
                For privacy-related questions, contact us through the WhatsApp number listed on our website.
              </p>
            </div>
          </section>

        </div>
      </Container>
    </div>
  );
}
