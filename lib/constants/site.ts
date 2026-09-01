export const siteConfig = {
  name: "Namma Ada",
  description:
    "Authentic Kerala delicacies, handcrafted with care and served in Bangalore.",
  tagline: "Soul Of Kerala, Served With Heart.",
  instagramUrl: "https://www.instagram.com/namma_ada/",
} as const;

export const storefrontRoutes = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
