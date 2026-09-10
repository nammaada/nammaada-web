import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, PackageOpen, ArrowUpRight, Clock, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact Us | Namma Ada",
  description:
    "Get in touch with Namma Ada for authentic Kerala delicacies, direct WhatsApp orders, bulk catering, and kitchen location in Bangalore.",
};

export default function ContactPage() {
  const whatsappChatUrl =
    "https://wa.me/919995811622?text=Hi%20Namma%20Ada%2C%20I%20have%20an%20inquiry!";
  const whatsappBulkUrl =
    "https://wa.me/919995811622?text=Hi%20Namma%20Ada%2C%20I%20would%20like%20to%20place%20a%20bulk%20%2F%20catering%20order!";
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=217%2C+9th+H+Main%2C+HRBR+1st+Block%2C+Kalyan+Nagar%2C+Bangalore%2C+Karnataka+560043";

  return (
    <div className="relative pt-6 pb-16 sm:pt-10 sm:pb-24">
      <Container className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#711e2c]/20 bg-[#711e2c]/5 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-[#711e2c]">
            <Sparkles size={12} />
            We&apos;d love to connect
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#2b1719] tracking-tight">
            Contact & Orders
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-[#2b1719]/75 leading-relaxed">
            Have a question about our authentic Kerala delicacies, or want to order directly? We&apos;re here to serve you with warm hospitality.
          </p>
        </div>

        {/* Highlighted Bulk Order Banner (WhatsApp Direct) */}
        <div className="relative overflow-hidden rounded-3xl border border-[#eedec8] bg-linear-to-br from-[#711e2c] via-[#5c1723] to-[#45101a] p-6 sm:p-8 text-[#fffcf2] shadow-xl mb-8">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f3c87a]/20 border border-[#f3c87a]/40 px-3 py-1 text-xs font-semibold text-[#ffdf99]">
                <PackageOpen size={14} />
                Special Bulk & Event Orders
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Planning a Celebration or Family Gathering?
              </h2>
              <p className="text-xs sm:text-sm text-[#fffcf2]/85 leading-relaxed">
                Order freshly steamed Ela Ada and traditional Kerala sweets in bulk. Connect with us directly on WhatsApp for customized quantities and timely delivery.
              </p>
            </div>

            <a
              href={whatsappBulkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-3 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <MessageCircle size={18} />
              <span>Bulk Order on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Card 1: WhatsApp Direct Chat */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2b1719]">
                  Instant WhatsApp Support
                </h3>
                <p className="text-xs sm:text-sm text-[#2b1719]/70 mt-1">
                  Message us for quick inquiries, same-day dispatch in Bangalore, or custom requests.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#eedec8]/50 flex items-center justify-between">
              <span className="font-semibold text-sm text-[#2b1719]">
                +91 9995811622
              </span>
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#20ba59] transition-all shadow-xs"
              >
                <span>Chat Now</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* Card 2: Phone & Email */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#711e2c]/10 text-[#711e2c] border border-[#711e2c]/20">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2b1719]">
                  Call & Email
                </h3>
                <p className="text-xs sm:text-sm text-[#2b1719]/70 mt-1">
                  Feel free to give us a phone call or drop an email anytime.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#eedec8]/50 space-y-2.5">
              <a
                href="tel:+919995811622"
                className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#2b1719] hover:text-[#711e2c] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Phone size={14} className="text-[#711e2c]" />
                  +91 9995811622
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#711e2c] bg-[#711e2c]/10 px-2 py-0.5 rounded-md">
                  Call
                </span>
              </a>

              <a
                href="mailto:namaste@nammaada.com"
                className="flex items-center justify-between text-xs sm:text-sm font-semibold text-[#2b1719] hover:text-[#711e2c] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Mail size={14} className="text-[#711e2c]" />
                  namaste@nammaada.com
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#711e2c] bg-[#711e2c]/10 px-2 py-0.5 rounded-md">
                  Email
                </span>
              </a>
            </div>
          </div>

          {/* Card 3: Kitchen & Delivery Location */}
          <div className="sm:col-span-2 flex flex-col justify-between rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#711e2c]/10 text-[#711e2c] border border-[#711e2c]/20">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#2b1719]">
                    Our Kitchen Location
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-[#2b1719]/80 mt-1 leading-relaxed">
                    217, 9th H Main, HRBR 1st Block, Kalyan Nagar, Bangalore, Karnataka 560043
                  </p>
                  <p className="text-xs text-[#2b1719]/60 mt-1 flex items-center gap-1.5">
                    <Clock size={12} />
                    Operating Kitchen Hours: 9:00 AM – 8:00 PM (Everyday)
                  </p>
                </div>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#711e2c]/30 bg-[#711e2c]/10 px-4 py-2 text-xs font-semibold text-[#711e2c] hover:bg-[#711e2c] hover:text-white transition-all active:scale-95 shadow-2xs"
              >
                <span>View on Google Maps</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
