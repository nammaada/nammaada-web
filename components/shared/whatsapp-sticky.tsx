"use client";

export function WhatsAppSticky() {
  const whatsappUrl =
    "https://wa.me/919995811622?text=Hi%20Namma%20Ada%2C%20I%20would%20like%20to%20know%20more%20about%20your%20delicacies!";

  return (
    <aside
      aria-label="WhatsApp Contact Button"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Namma Ada on WhatsApp"
        className="relative flex items-center justify-center size-13 sm:size-14 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba59] hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/80 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
      >
        {/* Subtle pulsing background ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon SVG */}
        <svg
          className="size-7 sm:size-8 fill-current relative z-10 drop-shadow-xs"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19.53-1.06 1.04-1.46 1.08-.39.04-.89.06-2.58-.64-2.15-.89-3.53-3.1-3.64-3.25-.11-.15-.87-1.16-.87-2.21s.55-1.57.75-1.78c.2-.21.43-.27.58-.27.15 0 .29 0 .42.01.14.01.32-.05.5.38.19.45.64 1.57.7 1.69.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.32-.36.43-.12.12-.25.25-.11.49.14.24.63 1.04 1.35 1.68.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.11.06.63-.13 1.16z" />
        </svg>

        {/* Hover label */}
        <span className="hidden sm:group-hover:inline-block absolute right-16 top-1/2 -translate-y-1/2 bg-[#2b1719] text-[#fffcf2] text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg border border-white/20 whitespace-nowrap transition-all pointer-events-none">
          Message us on WhatsApp
        </span>
      </a>
    </aside>
  );
}
