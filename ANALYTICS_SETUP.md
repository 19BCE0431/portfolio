# Analytics Setup

This portfolio now has a layered analytics setup:

- Google Analytics 4 for traffic, sources, geography, devices, page views, and daily reporting.
- Microsoft Clarity for free heatmaps, recordings, scroll maps, and behavior insights.
- Vercel Web Analytics and Speed Insights for privacy-friendly page analytics and Core Web Vitals when the site is hosted on Vercel.
- A private daily digest endpoint that emails a day-wise summary and can optionally send a shorter WhatsApp summary.

## Required Environment Variables

Add these locally in `.env.local` and in Vercel Project Settings before production deployment.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-KYQ1XELWXN
NEXT_PUBLIC_CLARITY_PROJECT_ID=wswfgi70h5
GA4_PROPERTY_ID=538116983
GA4_SERVICE_ACCOUNT_JSON=
CLARITY_API_TOKEN=
RESEND_API_KEY=
ANALYTICS_EMAIL_FROM="Portfolio Analytics <analytics@your-domain.com>"
ANALYTICS_EMAIL_TO=cm.mohhithh@gmail.com
CRON_SECRET=
ANALYTICS_WHATSAPP_NOTIFY=false
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TO_NUMBER=
```

`GA4_SERVICE_ACCOUNT_JSON` can be the raw service account JSON or base64-encoded JSON. If you prefer separate fields, use `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` instead.

## Google Analytics Daily Digest

The scheduled Vercel job runs at `01:00 UTC`, which is `06:30 IST`, and reports the previous full calendar day in India time.

GA4 has two IDs:

- Measurement ID: starts with `G-` and belongs in the website tag.
- Property ID: numeric ID used by the server-side Data API. This site uses `538116983`.

To make `GA4_SERVICE_ACCOUNT_JSON`:

1. Open Google Cloud Console and create or choose a project for the portfolio analytics job.
2. Enable **Google Analytics Data API** in that Google Cloud project.
3. Create a **Service Account** named something like `portfolio-analytics-reporter`.
4. Open the service account, create a JSON key, and download the JSON file.
5. Copy the service account email from the JSON file. It looks like `name@project.iam.gserviceaccount.com`.
6. Open GA4 Admin for property `538116983`.
7. Go to Property access management and add that service account email as **Viewer**.
8. Add the downloaded JSON contents to Vercel as `GA4_SERVICE_ACCOUNT_JSON`.

The JSON is a secret. Do not commit it. In Vercel, store it only as an encrypted environment variable.

## Microsoft Clarity

Create a Microsoft Clarity project, copy its project ID, and set `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
For automated Clarity rows in the daily email, generate a Data Export token in Clarity project settings and set `CLARITY_API_TOKEN`.

Clarity is intentionally controlled by an environment variable so staging, local work, or future private pages can avoid behavior recording.

## WhatsApp

WhatsApp is optional. Keep `ANALYTICS_WHATSAPP_NOTIFY=false` unless you want the daily digest to send through the official WhatsApp Business Cloud API.

Free-form WhatsApp text can depend on Meta's account state and message-window rules. Email is the primary reliable channel; WhatsApp is a convenience layer.

## Privacy Note

The site does not identify visitor names. Analytics can show aggregated location, device, source, pages, clicks, and behavior. A visitor's name is only possible if they knowingly submit it through a form or sign in, neither of which this portfolio currently does.
