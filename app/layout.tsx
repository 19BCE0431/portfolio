import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import { AnalyticsEvents } from "./components/AnalyticsEvents";
import { ActiveSectionProvider } from "./components/ActiveSectionProvider";
import { ChatbaseWidget } from "./components/ChatbaseWidget";
import { Cursor } from "./components/Cursor";
import { DeferredThirdPartyAnalytics } from "./components/DeferredThirdPartyAnalytics";
import { PointerField } from "./components/Kinetics";
import { PageTransition } from "./components/PageTransition";
import { Preloader } from "./components/Preloader";
import { SiteNav } from "./components/SiteNav";
import { SmoothScroll } from "./components/SmoothScroll";
// Order matters: legacy is confined to a cascade layer inside globals.css, and
// everything below it is unlayered, so the new system always wins.
import "./globals.css";
import "./styles/foundation.css";
import "./styles/motion.css";
import "./styles/chrome.css";
import "./styles/home.css";
import "./styles/routes.css";
import { profile } from "./data/portfolio";

// The one serif in the system — used for a single emphasised phrase per
// heading. Self-hosted by next/font, which the `font-src 'self'` CSP requires.
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
        url: "/og.png",
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
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: "#09090b",
};

const siteUrl = "https://mohitsaikrishna.in";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: profile.name,
  alternateName: profile.shortName,
  url: siteUrl,
  image: `${siteUrl}${profile.portrait}`,
  jobTitle: "MBA Candidate",
  description:
    "MBA candidate at IIM Sirmaur (Batch 2025-27, top 10% academic standing) with a Computer Science and Data Science foundation from VIT Vellore and applied AI experience at BigHaat. Works at the intersection of product strategy, marketing, business analytics, and AI-enabled systems.",
  email: `mailto:${profile.email}`,
  nationality: "Indian",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  knowsLanguage: ["English", "Hindi", "Telugu"],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Indian Institute of Management Sirmaur",
      sameAs: "https://www.iimsirmaur.ac.in/",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Vellore Institute of Technology",
      sameAs: "https://vit.ac.in/",
    },
  ],
  worksFor: {
    "@type": "Organization",
    name: "BigHaat Agro",
  },
  hasOccupation: [
    {
      "@type": "Occupation",
      name: "Data Science Engineer",
      occupationLocation: { "@type": "Country", name: "India" },
      skills:
        "Applied AI, RAG, price intelligence, document intelligence, anomaly detection, automation",
    },
    {
      "@type": "Occupation",
      name: "MBA Candidate",
      skills:
        "Product strategy, product marketing, business analytics, consumer behaviour, decision support",
    },
  ],
  hasCredential: [
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: "MBA (in progress) — IIM Sirmaur, Batch 2025-27",
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: "B.Tech, Computer Science — VIT Vellore, CGPA 9.15/10",
    },
    {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "award",
      name: "Academic Excellence — Top 10% of IIM Sirmaur Batch 2025-26",
    },
  ],
  knowsAbout: [
    "Product Strategy",
    "Product Marketing",
    "Business Analytics",
    "Applied AI",
    "Retrieval-Augmented Generation",
    "AI Workflows",
    "Data Science",
    "Consumer Behavior",
    "Decision Support Systems",
    "Retail and Agri-commerce",
  ],
  sameAs: [profile.linkedIn, profile.instagram].filter(Boolean),
};

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${siteUrl}/#profilepage`,
  url: siteUrl,
  name: `${profile.name} — Portfolio`,
  dateModified: new Date().toISOString(),
  mainEntity: { "@id": `${siteUrl}/#person` },
  inLanguage: "en-IN",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: `${profile.shortName} Portfolio`,
  url: siteUrl,
  author: { "@id": `${siteUrl}/#person` },
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
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="antialiased">
        {[personJsonLd, profilePageJsonLd, websiteJsonLd].map((jsonLd) => (
          <script
            key={jsonLd["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />
        ))}
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <ActiveSectionProvider>
          {/* The motion layer, finally mounted: inertial scroll, the shared
              pointer/velocity field, and the custom cursor. Each one no-ops
              under prefers-reduced-motion or on coarse pointers. */}
          <SmoothScroll />
          <PointerField />
          <Cursor />
          <Preloader />
          <SiteNav />
          <PageTransition>{children}</PageTransition>
          <AnalyticsEvents />
        </ActiveSectionProvider>
        <Analytics />
        <SpeedInsights />
        <DeferredThirdPartyAnalytics
          clarityProjectId={clarityProjectId}
          gaMeasurementId={gaMeasurementId}
        />
        <ChatbaseWidget />
      </body>
    </html>
  );
}
