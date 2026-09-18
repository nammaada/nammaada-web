import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { siteConfig } from "@/lib/constants/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://nammaada.com"),
  title: {
    default: "Namma Ada | Authentic Kerala Food & Snacks in Bangalore",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Namma Ada",
    "Kerala food Bangalore",
    "Kerala snacks Bangalore",
    "Kerala food online Bangalore",
    "Kerala snacks online Bangalore",
    "authentic Kerala food",
    "traditional Kerala snacks",
    "Unniyappam Bangalore",
    "Palada Payasam Bangalore",
    "Kerala banana chips Bangalore",
    "Kerala pickles Bangalore",
    "pure coconut oil Bangalore",
  ],
  authors: [{ name: "Namma Ada" }],
  creator: "Namma Ada",
  publisher: "Namma Ada",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://nammaada.com",
    siteName: "Namma Ada",
    title: "Namma Ada | Authentic Kerala Food & Snacks in Bangalore",
    description: siteConfig.description,
    images: [
      {
        url: "https://res.cloudinary.com/htzxecwe/image/upload/v1789553679/namma_ada_email_logo.png",
        width: 800,
        height: 600,
        alt: "Namma Ada - Authentic Kerala Delicacies in Bangalore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Namma Ada | Authentic Kerala Food & Snacks in Bangalore",
    description: siteConfig.description,
    images: ["https://res.cloudinary.com/htzxecwe/image/upload/v1789553679/namma_ada_email_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
