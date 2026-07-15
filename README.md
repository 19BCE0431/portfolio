# Mohit Portfolio

Personal portfolio for Mohit Sai Krishna Peddakotla.

## LinkedIn + Journal Automation

The content automation uses a safe manual LinkedIn workflow:

1. Generate a portfolio journal draft and LinkedIn copy-ready draft.
2. Email both previews through Resend.
3. Publish nothing until Mohit clicks approval.
4. Approval publishes only the portfolio journal.
5. A confirmation email sends the live journal URL and copy-ready LinkedIn post.
6. Mohit manually posts on LinkedIn.

LinkedIn auto-posting is intentionally disabled by default with `LINKEDIN_AUTO_POST=false`.

Schedule:

- Tuesday 10:30 AM IST / 05:00 UTC / `0 5 * * 2`: AI + business + MBA-level market analysis.
- Thursday 3:30 PM IST / 10:00 UTC / `0 10 * * 4`: career learning, IIM life, internship reflection, portfolio/project reflection, or personal-growth content.

Quality rule: every generated post should sound like Mohit, include a compact MBA analytics layer, avoid generic LinkedIn phrasing, score at least 9/10 on every quality metric with a 9.5+ average, and use only 2-4 specific hashtags.

Full setup details live in [content-system/LINKEDIN_JOURNAL_AUTOMATION.md](content-system/LINKEDIN_JOURNAL_AUTOMATION.md).

## Required Automation Environment

- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `CONTENT_AUTOMATION_EMAIL_FROM` or `ANALYTICS_EMAIL_FROM`
- `CONTENT_AUTOMATION_EMAIL_TO` or `ANALYTICS_EMAIL_TO`
- `CRON_SECRET`
- `LINKEDIN_APPROVAL_SECRET`
- `GITHUB_CONTENT_TOKEN`
- `GITHUB_CONTENT_REPO`
- `GITHUB_CONTENT_BRANCH`
- `CONTENT_AUTOMATION_BASE_URL`
- `LINKEDIN_AUTO_POST=false`

Do not expose private keys with `NEXT_PUBLIC_`.

## Local Checks

```bash
npm run lint
npm run build
```

Manual dry run:

```bash
CRON_SECRET=test npm run dev
curl -X POST "http://localhost:3000/api/content/linkedin-cycle" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"action":"dry-run","cycleType":"tuesday_market"}'
```

Thursday dry run:

```bash
curl -X POST "http://localhost:3000/api/content/linkedin-cycle" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"action":"dry-run","cycleType":"thursday_reflection"}'
```
