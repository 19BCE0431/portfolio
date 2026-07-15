# LinkedIn + Portfolio Journal Automation

This system uses a safe manual LinkedIn workflow.

Final decision:

- Do not auto-post to LinkedIn.
- Do not build LinkedIn OAuth for the basic workflow.
- Do not require LinkedIn API keys for the basic workflow.
- Keep `LINKEDIN_AUTO_POST=false`.
- Approval publishes only the portfolio journal.
- LinkedIn remains manual copy-paste only.

## Weekly Schedule

The content automation generates and emails approval drafts exactly two times per week:

| Lane | IST time | UTC time | Vercel cron | Route | Content |
| --- | --- | --- | --- | --- | --- |
| Tuesday AI/Business | Tuesday 10:30 AM IST | Tuesday 05:00 UTC | `0 5 * * 2` | `/api/cron/linkedin-content-cycle/tuesday` | AI + business + MBA-level market analysis |
| Thursday Career/Reflection | Thursday 3:30 PM IST | Thursday 10:00 UTC | `0 10 * * 4` | `/api/cron/linkedin-content-cycle/thursday` | Career learning, IIM life, internship reflection, portfolio/project reflection, or personal-growth content |

The generic protected route `/api/cron/linkedin-content-cycle` is kept as a fallback. If a hosting plan requires one content cron, point that route at a broader cron and it will skip unless the interpreted IST time is exactly Tuesday 10:30 AM or Thursday 3:30 PM.

## Workflow

1. The scheduled route generates a portfolio journal draft and a LinkedIn copy-ready draft.
2. The journal is saved with `status: pending_review`, so it is not visible on the production portfolio.
3. The LinkedIn draft includes `[Portfolio journal link will be added after approval]`.
4. Resend emails Mohit the journal preview, LinkedIn copy, sources, suggested posting time, Approve Journal button, Reject button, and Open LinkedIn button.
5. Clicking Approve Journal publishes only the portfolio journal by changing the journal status to `published`.
6. A confirmation email sends the live journal URL and final LinkedIn copy with the live journal link inserted.
7. Mohit manually copies the LinkedIn text and posts it on LinkedIn.
8. Clicking Reject marks the run as rejected and publishes nothing.

## Voice And Quality Bar

Every generated topic must sound like Mohit, not a generic LinkedIn creator:

- analytical, warm, observant, and grounded in IIM MBA learning
- shaped by data science, product, automation, dashboards, anomaly detection, and business operations experience
- skeptical of vague business language
- practical enough for operators, product people, marketers, founders, consultants, recruiters, and MBA peers

Every topic must include a high-quality MBA analytics layer:

- hidden metric: what the normal dashboard is missing
- proxy metric: what can be measured before the issue becomes visible
- leading indicator: what changes first
- management question: what a leader should ask
- action implication: what the organization should redesign

Every LinkedIn draft is evaluated against 20 metrics:

- Eyebrow Raise Score
- Novelty Score
- Intellectual Tension Score
- Reflection Score
- Comment Potential Score
- Memorability Score
- MBA Depth Score
- Humanness Score
- Escalation Score
- Shareability Score
- Insight Density Score
- Contrarian Strength Score
- Framework Quality Score
- Evidence Credibility Score
- Boardroom Relevance Score
- Discussion Longevity Score
- Quoteability Score
- Pattern Recognition Score
- Perspective Shift Score
- "I've Never Thought About It That Way" Score

Every metric must be at least 9.0, and the average must be at least 9.5 before the system sends the approval email.

Avoid generic phrasing such as:

- "think about that"
- "every organization has..."
- "the best organizations understand this"
- "game changer"
- "unlock"
- "delve"
- "journey"
- "thrilled"
- "in today's world"

LinkedIn drafts must use only 2-4 specific hashtags. Avoid broad hashtag dumps.

## Routes

- `GET /api/cron/linkedin-content-cycle/tuesday`
  - Protected by `CRON_SECRET`.
  - Runs the Tuesday AI/Business lane.

- `GET /api/cron/linkedin-content-cycle/thursday`
  - Protected by `CRON_SECRET`.
  - Runs the Thursday Career/Reflection lane.

- `GET /api/cron/linkedin-content-cycle`
  - Protected by `CRON_SECRET`.
  - Fallback route that checks IST day/time internally and skips outside the two approved windows.

- `POST /api/content/linkedin-cycle`
  - Protected by `CRON_SECRET`.
  - Manual trigger and test route.
  - Supports `cycleType: "tuesday_market"` and `cycleType: "thursday_reflection"`.
  - Supports `action: "dry-run"` without saving or emailing.
  - Supports `action: "send-latest-approval"`, `action: "send-approval"`, and `action: "regenerate"`.

- `GET /api/content/approve-journal?token=...`
  - Validates the signed token.
  - Publishes only the portfolio journal.
  - Updates the LinkedIn draft to `linkedin_manual_ready`.
  - Shows a copy-ready LinkedIn page with a Copy LinkedIn Post button and Open LinkedIn links.
  - Does not post to LinkedIn.

- `GET /api/content/approve-linkedin-post?token=...`
  - Backward-compatible redirect to `/api/content/approve-journal`.

- `GET /api/content/reject-linkedin-post?token=...`
  - Validates the signed token.
  - Marks the run as `rejected`.
  - Publishes nothing.

- `POST /api/content/publish-linkedin-post`
  - Protected by `CRON_SECRET`.
  - Returns `410 Gone` because LinkedIn auto-posting is disabled in this workflow.

## Statuses

Run statuses:

- `pending_review`
- `regenerated`
- `rejected`
- `journal_approved`
- `journal_published`
- `linkedin_manual_ready`
- `failed`

Legacy `pending_approval` runs are still accepted so older approval emails do not break.

Journal statuses:

- `pending_review`
- `published`
- existing legacy `draft` and `review`

## Logs

The route logs structured events with:

- schedule type
- UTC trigger time
- IST interpreted time
- whether generation ran or skipped
- email sent status
- journal approval status
- journal published status
- rejection/regeneration/failure status

Event names include:

- `schedule_check`
- `schedule_skipped`
- `generated`
- `email_sent`
- `journal_approved`
- `journal_published`
- `rejected`
- `failed`

## Required Environment Variables

Basic workflow:

- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `CONTENT_AUTOMATION_EMAIL_FROM` or `ANALYTICS_EMAIL_FROM`
- `CONTENT_AUTOMATION_EMAIL_TO` or `ANALYTICS_EMAIL_TO`
- `CRON_SECRET`
- `LINKEDIN_APPROVAL_SECRET`
- `CONTENT_AUTOMATION_BASE_URL`
- `GITHUB_CONTENT_TOKEN`
- `GITHUB_CONTENT_REPO`
- `GITHUB_CONTENT_BRANCH`
- `LINKEDIN_AUTO_POST=false`

Optional future LinkedIn API variables:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_PERSON_URN` or `LINKEDIN_AUTHOR_URN`
- `LINKEDIN_VERSION`

These optional variables are not required for the current workflow and are not used by approval.

## Manual Tests

Start the app locally with a test cron secret:

```bash
CRON_SECRET=test npm run dev
```

Tuesday-style dry run:

```bash
curl -X POST "http://localhost:3000/api/content/linkedin-cycle" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"action":"dry-run","cycleType":"tuesday_market"}'
```

Thursday-style dry run:

```bash
curl -X POST "http://localhost:3000/api/content/linkedin-cycle" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"action":"dry-run","cycleType":"thursday_reflection"}'
```

Generate and email a Tuesday approval draft:

```bash
curl -X POST "http://localhost:3000/api/content/linkedin-cycle" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"cycleType":"tuesday_market"}'
```

Generate and email a Thursday approval draft:

```bash
curl -X POST "http://localhost:3000/api/content/linkedin-cycle" \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"cycleType":"thursday_reflection"}'
```

## Verification

After clicking Approve Journal:

1. Open the confirmation page or email.
2. Confirm the live journal URL opens on the portfolio.
3. Confirm the run status is `linkedin_manual_ready`.
4. Confirm the LinkedIn draft includes the live journal link.
5. Confirm no LinkedIn post was created automatically.

After clicking Reject:

1. Confirm the run status is `rejected`.
2. Confirm the journal markdown still is not `published`.
3. Confirm nothing appears on the live portfolio.
4. Confirm nothing was posted to LinkedIn.
