import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AnalyticsEvents } from "./components/AnalyticsEvents";
import { MicrosoftClarity } from "./components/MicrosoftClarity";
import { PageTransition } from "./components/PageTransition";
import { SiteNav } from "./components/SiteNav";
import "./globals.css";
import { profile } from "./data/portfolio";

export const metadata: Metadata = {
  metadataBase: new URL("https://mohitsaikrishna.in"),
  title: {
    default: profile.name,
    template: `%s | ${profile.name}`,
  },
  description:
    "Mohit Sai Krishna Peddakotla is an MBA candidate at IIM Sirmaur exploring product, marketing, strategy, consumer behavior, and AI-enabled workflows with a Computer Science and Data Science foundation.",
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
      "MBA candidate at IIM Sirmaur exploring product, marketing, strategy, consumer behavior, and AI-enabled workflows.",
    siteName: profile.name,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: profile.name,
    description:
      "MBA candidate at IIM Sirmaur exploring product, marketing, strategy, consumer behavior, and AI-enabled workflows.",
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
  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-KYQ1XELWXN";
  const clarityProjectId =
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "wswfgi70h5";

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <SiteNav />
        <PageTransition>{children}</PageTransition>
        <AnalyticsEvents />
        <Analytics />
        <SpeedInsights />
        <MicrosoftClarity projectId={clarityProjectId} />
        <GoogleAnalytics gaId={gaMeasurementId} />
      </body>
    </html>
  );
}
