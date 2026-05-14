import type { Metadata } from "next";
import { PageTransition } from "./components/PageTransition";
import "./globals.css";
import { profile } from "./data/portfolio";

export const metadata: Metadata = {
  metadataBase: new URL("https://mohitakrishna.in"),
  title: {
    default: profile.name,
    template: `%s | ${profile.name}`,
  },
  description:
    "Mohit Sai Krishna Peddakotla is an MBA candidate at IIM Sirmaur (2025-2027) with a Computer Science background and experience building applied AI, data, and automation systems. Interests include product strategy, marketing, retail learning, and business decision-making.",
  keywords: [
    "Mohit Sai Krishna Peddakotla",
    "IIM Sirmaur",
    "MBA",
    "Data Science",
    "Applied AI",
    "RAG",
    "Automation",
    "Product strategy",
    "Marketing",
    "Retail",
    "Business decision-making",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: profile.name,
    description:
      "MBA candidate at IIM Sirmaur with a Computer Science foundation and applied AI/data systems experience. Building toward product strategy, marketing, retail learning, and business decision-making.",
    siteName: profile.name,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.name,
    description:
      "MBA candidate at IIM Sirmaur with a Computer Science foundation and applied AI/data systems experience.",
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
