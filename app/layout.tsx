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
    default: `${profile.shortName} | Product, Strategy & AI`,
    template: `%s | ${profile.name}`,
  },
  description:
    "IIM Sirmaur MBA candidate exploring product strategy, business analytics, AI workflows, and decision-making across technology and markets.",
  keywords: [
    "Mohit Sai Krishna Peddakotla",
    "Mohit Sai Krishna",
    "IIM Sirmaur",
    "IIM Sirmaur MBA",
    "MBA",
    "Data Science",
    "Applied AI",
    "RAG",
    "Automation",
    "Product strategy",
    "Product marketing",
    "Business analytics",
    "Marketing",
    "BigHaat",
    "Portfolio",
    "Retail",
    "Business decision-making",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  publisher: profile.name,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: `${profile.shortName} | Product, Strategy & AI`,
    description:
      "IIM Sirmaur MBA candidate exploring product strategy, business analytics, AI workflows, and decision-making across technology and markets.",
    siteName: profile.name,
    locale: "en_IN",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${profile.name} portfolio preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.shortName} | Product, Strategy & AI`,
    description:
      "IIM Sirmaur MBA candidate exploring product strategy, business analytics, AI workflows, and decision-making across technology and markets.",
    images: ["/twitter-image"],
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.shortName,
  url: "https://mohitsaikrishna.in",
  image: `https://mohitsaikrishna.in${profile.portrait}`,
  jobTitle: "MBA Candidate",
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: "IIM Sirmaur",
  },
  knowsAbout: [
    "Product Strategy",
    "Product Marketing",
    "Business Analytics",
    "AI Workflows",
    "Data Science",
    "Consumer Behavior",
    "Retail",
  ],
  sameAs: [profile.linkedIn, profile.instagram].filter(Boolean),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: `${profile.shortName} Portfolio`,
  url: "https://mohitsaikrishna.in",
  author: {
    "@type": "Person",
    name: profile.name,
  },
  inLanguage: "en-IN",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd, websiteJsonLd]).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
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
