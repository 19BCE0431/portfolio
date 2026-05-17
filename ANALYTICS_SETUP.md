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
NEXT_PUBLIC_CLARITY_PROJECT_ID=
GA4_PROPERTY_ID=
GA4_SERVICE_ACCOUNT_JSON=
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

1. In Google Cloud, enable the Google Analytics Data API.
2. Create a service account.
3. In GA4, add the service account email as a Viewer on the property.
4. Set `GA4_PROPERTY_ID` to the numeric GA4 property ID, not the `G-...` measurement ID.
5. Set `CRON_SECRET` to a long random value.
6. Set the Resend values so the digest can be emailed.

The scheduled Vercel job runs at `02:30 UTC`, which is `08:00 IST`, and reports the GA4 property's `yesterday` data.

## Microsoft Clarity

Create a Microsoft Clarity project, copy its project ID, and set `NEXT_PUBLIC_CLARITY_PROJECT_ID`.

Clarity is intentionally controlled by an environment variable so staging, local work, or future private pages can avoid behavior recording.

## WhatsApp

WhatsApp is optional. Keep `ANALYTICS_WHATSAPP_NOTIFY=false` unless you want the daily digest to send through the official WhatsApp Business Cloud API.

Free-form WhatsApp text can depend on Meta's account state and message-window rules. Email is the primary reliable channel; WhatsApp is a convenience layer.

## Privacy Note

The site does not identify visitor names. Analytics can show aggregated location, device, source, pages, clicks, and behavior. A visitor's name is only possible if they knowingly submit it through a form or sign in, neither of which this portfolio currently does.
