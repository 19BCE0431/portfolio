# LinkedIn + Portfolio Journal Automation

This system is designed for safe semi-automatic publishing:

1. A cron route prepares or finds a journal + LinkedIn content cycle.
2. The portfolio journal is published first.
3. An approval email is sent to the configured owner email.
4. The email contains signed approve/reject links.
5. LinkedIn posting happens only after approval and only through the official LinkedIn API.
6. If credentials are missing, the journal can still publish and the email includes a ready-to-copy LinkedIn draft.

There is no public admin button. Approval links are email-only, signed, expiring, and handled server-side.

## Routes

- `GET /api/cron/linkedin-content-cycle`
  - Protected by `CRON_SECRET`.
  - Posts previously approved due items, generates/publishes a new journal cycle when OpenAI + GitHub content storage are configured, then sends the approval email for the newest pending draft.

- `POST /api/content/linkedin-cycle`
  - Protected by `CRON_SECRET`.
  - Manual server-side trigger for the same cycle.

- `GET /api/content/approve-linkedin-post?token=...`
  - Validates signed token, expiry, action, stored token hash, and current run status.
  - Marks the run approved when persistent storage is configured.
  - Posts immediately through the LinkedIn API only if `LINKEDIN_AUTO_POST=true` and LinkedIn credentials are valid.

- `GET /api/content/reject-linkedin-post?token=...`
  - Validates signed token and marks the run rejected.

- `POST /api/content/publish-linkedin-post`
  - Protected by `CRON_SECRET`.
  - Server-side manual publish for an already approved run.

## Safety Model

- LinkedIn access tokens are server-only environment variables.
- Approval links contain only a signed token, never LinkedIn credentials.
- Tokens expire in 24 hours or at the run expiration, whichever comes first.
- Tokens are single-use only when GitHub content storage is configured, because the run stores token hashes and status transitions.
- If persistent storage is missing, approval links do not publish to LinkedIn.
- The LinkedIn API is the only posting mechanism. Browser scraping is not used.
- Error responses are sanitized and do not expose secret values.

## Required Environment Variables

Core:

- `RESEND_API_KEY`
- `ANALYTICS_EMAIL_FROM` or `CONTENT_AUTOMATION_EMAIL_FROM`
- `ANALYTICS_EMAIL_TO` or `CONTENT_AUTOMATION_EMAIL_TO`
- `CRON_SECRET`
- `LINKEDIN_APPROVAL_SECRET`

For automatic future journal generation and repo publishing:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GITHUB_CONTENT_TOKEN`
- `GITHUB_CONTENT_REPO`
- `GITHUB_CONTENT_BRANCH`

For approved LinkedIn auto-posting:

- `LINKEDIN_AUTO_POST=true`
- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_PERSON_URN` or `LINKEDIN_AUTHOR_URN`
- `LINKEDIN_VERSION`

Optional analytics feedback:

- `GA4_SERVICE_ACCOUNT_JSON`
- `CLARITY_API_TOKEN`

Do not prefix LinkedIn, GitHub, Resend, OpenAI, or approval secrets with `NEXT_PUBLIC_`.

## LinkedIn API Requirements

Before auto-posting can be enabled:

- A LinkedIn Developer App must exist.
- OAuth must be configured.
- The token must include `w_member_social`.
- The member/person URN must be known.
- Token expiry/refresh must be monitored.

If any of those are missing, keep `LINKEDIN_AUTO_POST=false`. The system will still email the copy-ready LinkedIn draft.

## Posting Cadence

The Vercel cron runs every three days at `03:00 UTC` / `08:30 IST`.

Each cycle publishes the portfolio journal first, emails the LinkedIn draft for approval, and posts to LinkedIn only after the signed approval link is clicked.

Fallback best posting window:

- Tuesday to Thursday
- 8:30-10:30 AM IST
- Secondary option: 6:30-8:30 PM IST
- Avoid late-night posting

## Topic Quality Rubric

Each candidate topic should be scored for:

- Timeliness
- Audience relevance
- Non-obviousness
- Engagement potential
- Journal depth potential
- Personal-brand fit
- Risk level

The final topic must clear a strict 9.2/10 bar across originality, expert relevance, clarity, personal-brand fit, and usefulness. Skip the cycle if the best topic is weak, familiar, high-risk, too generic, political, stock-advice-like, or unsupported.

Weak angles to avoid:

- Basic "agentic AI is coming" commentary
- "AI is no longer just a tool" hooks
- Content-volume arguments that everyone has already heard
- Generic productivity posts
- Motivation posts without a business mechanism
- Big claims without a specific operating example

## Content Rules

Journal first:

- Strong title and excerpt
- Clear business/product/marketing implications
- Practical examples
- Personal lens from data science, MBA, and operating workflows
- Source links where useful
- Mobile-readable sections
- Clear closing takeaway

LinkedIn second:

- 1.5-2 minute read
- First two lines must raise an eyebrow
- Short paragraphs
- 3-5 crisp points
- One soft question
- 3-5 hashtags
- UTM link to the journal
- Must contain a real business mechanism, not a summary of obvious trends
- Must sound like Mohit thinking through business, product, analytics, and MBA lenses

Avoid:

- Generic motivation
- Shallow AI hype
- Unsupported numbers
- Fake claims
- Controversial politics
- Stock advice
- "In today's fast-paced world" hooks
- "AI is becoming..." openings
- Inflated scores for drafts that are only basic or familiar

## Token Rotation

Rotate these immediately if they are pasted into chat, logs, screenshots, or third-party tools:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_APPROVAL_SECRET`
- `GITHUB_CONTENT_TOKEN`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `CRON_SECRET`

After rotation, redeploy and send a test approval email.

## Disable Automation

To stop LinkedIn posting:

- Set `LINKEDIN_AUTO_POST=false`

To stop content generation:

- Remove `OPENAI_API_KEY` or `GITHUB_CONTENT_TOKEN`

To stop cron execution:

- Remove `/api/cron/linkedin-content-cycle` from `vercel.json`

## Monitoring Checklist

- Cron returns `401` without `CRON_SECRET`.
- Approval and reject links reject invalid tokens.
- Approval endpoint does not post without stored token hash.
- LinkedIn auto-post remains blocked unless all LinkedIn env vars are present.
- Journal route loads after deployment.
- Email includes journal link, LinkedIn draft, risk level, and posting time.
- After posting, confirm LinkedIn post ID and portfolio UTM traffic.
