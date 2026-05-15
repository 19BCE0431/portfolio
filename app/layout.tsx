import type { Metadata } from "next";
import { PageTransition } from "./components/PageTransition";
import "./globals.css";
import { profile } from "./data/portfolio";

export const metadata: Metadata = {
  metadataBase: new URL("https://mohitsaikrishna.in"),
  title: {
    default: profile.name,
    template: `%s | ${profile.name}`,
  },
  description:
    "Mohit Sai Krishna Peddakotla is an MBA candidate at IIM Sirmaur (2025-2027) building toward product management, marketing, strategy, consumer behavior, AI-enabled workflows, and business decision-making, with a Computer Science and Data Science foundation.",
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
      "MBA candidate at IIM Sirmaur building toward product management, marketing, strategy, consumer behavior, AI-enabled workflows, and business decision-making.",
    siteName: profile.name,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.name,
    description:
      "MBA candidate at IIM Sirmaur building toward product, marketing, strategy, AI-enabled workflows, and business decisions.",
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
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
