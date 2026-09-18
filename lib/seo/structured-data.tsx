import React from "react";

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Namma Ada",
  alternateName: "NammaAda",
  url: "https://nammaada.com",
  logo: "https://res.cloudinary.com/htzxecwe/image/upload/v1789553679/namma_ada_email_logo.png",
  image: "https://res.cloudinary.com/htzxecwe/image/upload/v1789553679/namma_ada_email_logo.png",
  description:
    "Bangalore-based Kerala delicacy brand inspired by generation-old recipes. Handcrafting fresh Chill Ada, Palada Payasam, Unniyappam, crispy Banana Chips, and pure coconut oil.",
  telephone: "+919995811622",
  email: "namaste@nammaada.com",
  servesCuisine: ["Kerala", "South Indian", "Traditional Sweets", "Snacks"],
  priceRange: "₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "217, 9th H Main, HRBR 1st Block, Kalyan Nagar",
    addressLocality: "Bangalore",
    addressRegion: "Karnataka",
    postalCode: "560043",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 13.0163,
    longitude: 77.6433,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "20:00",
    },
  ],
  sameAs: ["https://www.instagram.com/namma_ada/"],
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Namma Ada",
  url: "https://nammaada.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://nammaada.com/products?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};
