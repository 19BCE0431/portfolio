# Agentic Content System

This is the internal architecture for future weekly AI-assisted portfolio writing. It is designed to help create thoughtful long-form portfolio blogs and shorter LinkedIn drafts without sounding automated, generic, or inflated.

No part of this system should auto-publish to the portfolio, LinkedIn, WhatsApp, email, or any other channel without Mohit's explicit review and approval.

## Folder Map

- `content/research-notes/` stores raw weekly research notes, source lists, topic candidates, and fact checks.
- `content/journal/` stores portfolio blog drafts and published long-form posts.
- `content/linkedin-drafts/` stores LinkedIn adaptations connected to a portfolio blog.
- `content/generated-assets/` stores AI-generated or copyright-safe visual briefs, prompts, licenses, alt text, and asset metadata.
- `content/analytics/` stores manual LinkedIn and journal performance tracking.
- `content/analytics/reports/` stores weekly performance reports.
- `scripts/generate-weekly-insight.js` creates one weekly research note, one portfolio blog draft, one LinkedIn draft, and one visual prompt file for review.
- `scripts/analyze-content-performance.js` reads manual analytics and recommends future topic direction.

## Running The Weekly Generator

Use this command from the project root:

```bash
npm run generate:weekly-insight
```

Useful options:

```bash
npm run generate:weekly-insight -- --dry-run
npm run generate:weekly-insight -- --topic "AI pricing changes and product adoption"
npm run generate:weekly-insight -- --status draft
npm run generate:weekly-insight -- --use-ai
npm run analyze:content-performance
```

The generator writes files to:

- `content/research-notes/`
- `content/journal/`
- `content/linkedin-drafts/`
- `content/generated-assets/`

If analytics rows exist, the generator also reads:

- `content/analytics/linkedin-performance.csv`
- `content/analytics/journal-performance.csv`

Those rows influence topic scoring as a soft signal. They never override source quality, human review, or editorial judgment.

The default status is `review`. The script does not set anything to `published`, does not post to LinkedIn, and does not send WhatsApp messages.

Environment variables can be added through `.env` or `.env.local`. Use `.env.example` as the safe template. Real secrets must never be committed.

Without `OPENAI_API_KEY`, the script creates a conservative review scaffold from collected sources. With `OPENAI_API_KEY` and `--use-ai`, it can generate fuller prose while still keeping approval status locked to draft or review.

Use `OPENAI_MODEL=gpt-4.1` for higher-quality weekly writing. Use `gpt-4.1-mini` only for cheaper drafts, dry runs, or testing the workflow.

## Environment And Secret Safety

Use `.env.example` only as a placeholder template. It must never contain real tokens, API keys, OAuth credentials, phone-number IDs, or access tokens.

For local development:

- Add real keys only in `.env.local`.
- Never commit `.env.local`.
- Never paste real keys into chat, documentation, source files, generated drafts, workflow logs, or PR descriptions.
- Treat any key accidentally shared in chat as exposed and revoked.

For GitHub Actions automation:

- Add real keys only as GitHub repository secrets.
- Use GitHub Actions `secrets.*` references inside workflows.
- Do not echo secrets, write them to generated content, or print full API responses that may contain sensitive data.

Required or optional secrets:

- `OPENAI_API_KEY` for AI-assisted writing.
- `NEWS_API_KEY` or `SERP_API_KEY` for broader topic discovery.
- `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_AUTHOR_URN` for future official LinkedIn posting.
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_TO_NUMBER` for future WhatsApp Cloud API notifications.

LinkedIn and WhatsApp credentials must be obtained manually through their official API, OAuth, or developer dashboard setup. Codex must not fetch, scrape, infer, reuse, or recover credentials from browsers, password managers, screenshots, shell history, chat history, or local private files.

## Weekly GitHub Actions Workflow

The weekly automation lives in `.github/workflows/weekly-insight.yml`.

Schedule:

- Runs every Sunday at 09:00 India time.
- Cron equivalent: `30 3 * * 0` UTC.
- Also supports manual runs through GitHub's `workflow_dispatch`.

Default review-first behavior:

1. Checks out the repository.
2. Verifies `OPENAI_API_KEY` is configured.
3. Installs dependencies with `npm ci`.
4. Runs `npm run generate:weekly-insight` with status locked to `review` or `draft`.
5. Runs lint and build checks.
6. Commits generated content to `weekly-insight/YYYY-MM-DD`.
7. Opens or updates a pull request titled `Weekly insight draft: YYYY-MM-DD`.

In default mode, it does not:

- It does not merge the pull request.
- It does not mark posts as `published`.
- It does not post to LinkedIn.
- It does not send WhatsApp messages unless `WHATSAPP_NOTIFY=true` and WhatsApp credentials are configured.
- It does not deploy directly to production except through the normal merge/deploy flow.

### Adding GitHub Actions Secrets

In GitHub, open:

`Repository Settings -> Secrets and variables -> Actions -> New repository secret`

Add these values as needed:

- `OPENAI_API_KEY` is required for the weekly workflow.
- `OPENAI_MODEL` should usually be `gpt-4.1` for higher-quality writing.
- `NEWS_API_KEY` is optional for news discovery.
- `SERP_API_KEY` is optional for search discovery.
- `WEEKLY_INSIGHT_PORTFOLIO_BASE_URL` should be `https://mohitsaikrishna.in`.
- `WEEKLY_INSIGHT_STATUS` should be `review`.
- `WEEKLY_INSIGHT_AUTO_PUBLISH` should stay `false`; the committed weekly workflow is review-first.
- `LINKEDIN_AUTO_POST` should stay `false`; LinkedIn posting uses the separate manual workflow.
- `WHATSAPP_NOTIFY` should stay `false` unless intentionally enabling WhatsApp notifications.

If `OPENAI_API_KEY` is missing, the workflow fails early with a clear message instead of generating weak content or silently falling back.

### Running The Workflow Manually

In GitHub:

1. Open the `Actions` tab.
2. Select `Weekly Insight Draft`.
3. Click `Run workflow`.
4. Run it from the main branch unless testing a workflow change.

The workflow will create or update a branch named `weekly-insight/YYYY-MM-DD` and open a PR for review.

### Reviewing The PR

Before merging:

- Read the generated portfolio article from `content/journal/`.
- Check the research note in `content/research-notes/`.
- Review the LinkedIn draft in `content/linkedin-drafts/`.
- Review visual prompts in `content/generated-assets/`.
- Verify every claim that depends on a source.
- Rewrite anything generic, robotic, exaggerated, or unsupported.
- Confirm the article status remains `review` until it is intentionally ready to publish.

Merge the PR only after human review. Merging is the manual approval step that lets the portfolio content update through the normal deployment flow.

## Optional Full Auto-Publish Mode

Recommendation: keep review-first mode enabled unless Mohit intentionally chooses full automation for a specific period.

Full automation is intentionally not enabled in the committed weekly workflow. The flags below are reserved for a future, separate workflow or controlled update after another review:

```text
WEEKLY_INSIGHT_AUTO_PUBLISH=true
LINKEDIN_AUTO_POST=true
WHATSAPP_NOTIFY=true
```

Each flag should control a separate layer if full automation is added later:

- `WEEKLY_INSIGHT_AUTO_PUBLISH=true` would allow a future workflow to generate content with `status: "published"`, validate it, commit directly to `main`, and let Vercel deploy from `main`.
- `LINKEDIN_AUTO_POST=true` allows LinkedIn posting only after auto-publish succeeds, the blog is published, the LinkedIn draft exists, and `LINKEDIN_ACCESS_TOKEN` plus `LINKEDIN_AUTHOR_URN` are configured.
- `WHATSAPP_NOTIFY=true` allows optional WhatsApp messages after PR creation, portfolio publishing, LinkedIn posting, or workflow failure, only when WhatsApp Cloud API credentials are configured.

The auto-publish safety validator `scripts/validate-weekly-publish.js` must run before any future workflow can push published content. It blocks publishing when:

- Blog title or article body is missing.
- Blog status is not `published`.
- Portfolio base URL is missing or not HTTPS.
- Canonical URL is missing.
- Source links are empty.
- LinkedIn draft is missing or not approved.
- The article or LinkedIn draft contains `TODO`, placeholder language, review markers, or source-discovery-only text.

Risks:

- Fully automated publishing can still produce writing that is technically valid but not tasteful enough.
- Source-backed writing may need human judgment even when sources exist.
- LinkedIn and WhatsApp APIs can fail because of token expiry, permission changes, or platform policy.

Required secrets for full automation:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `NEWS_API_KEY` or `SERP_API_KEY`
- `WEEKLY_INSIGHT_PORTFOLIO_BASE_URL`
- `WEEKLY_INSIGHT_AUTO_PUBLISH`
- `LINKEDIN_AUTO_POST`
- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_AUTHOR_URN`
- `WHATSAPP_NOTIFY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TO_NUMBER`

No secret should be hardcoded, written to generated content, printed in logs, or committed.

## Weekly Workflow

1. Research the week across AI, product, technology, business, marketing, consumer behavior, startups, India-relevant market signals, and global product strategy.
2. Capture source links, publication dates, access dates, and the specific claims each source supports.
3. Shortlist multiple possible topics with a one-line thesis for each.
4. Score each topic for usefulness, novelty, shareability, comment potential, clarity, credibility, visual potential, and Mohit's personal-fit score.
5. If analytics exist, add a light historical signal based on high-performing pillars, hooks, formats, clicks, and comments.
6. Select the best combined topic, not simply the newest topic.
7. Create a research note first, then draft the long-form portfolio article.
8. Fact-check all research-backed claims against stored source links.
9. Move the article to `review` status for human review.
10. Create a LinkedIn draft that links back to the portfolio article.
11. Publish only after Mohit approves the blog and the LinkedIn draft separately.

## Content Pillars

Weekly topics should usually fit one of these pillars:

- AI & Business
- Product Strategy
- Indian Consumer Behavior
- Market Signals
- Brand & Marketing Lessons
- Business History with Modern Relevance
- MBA Learning Notes
- Data Science Applied to Decisions

The content should not become pure general knowledge, exam-prep material, or a random news summary. The lens should be useful for MBA students, product management aspirants, marketing and strategy learners, business-curious students, early professionals, and Indian readers interested in business, AI, economy, brands, and consumer behavior.

## Research Sources

Prioritize primary and credible sources:

- Company announcements, product blogs, engineering blogs, investor letters, earnings calls, annual reports, and official documentation.
- Research papers, reputable academic publications, and official standards where relevant.
- Government, regulator, and public datasets for India-specific business or consumer topics.
- Credible business and technology publications when primary sources are not enough.
- Founder, executive, or product leader interviews only when the original context is available.

Avoid using social media summaries, anonymous commentary, or newsletter recaps as the only source for factual claims.

## Topic Selection Criteria

A weekly topic should pass most of these checks:

- It is recent enough to feel timely.
- It matters to MBA students, product aspirants, marketers, strategy learners, early professionals, or business-curious Indian readers.
- It has a clear business, product, strategy, marketing, or consumer behavior lesson.
- It has a surprising angle beyond the obvious headline.
- It can connect India and global business context where useful.
- It can be explained with credible sources.
- It gives Mohit room for a grounded personal interpretation without pretending to be an expert.
- It does not feel like another generic AI trend summary.

### Topic Scoring Framework

The weekly generator stores a candidate topic scoreboard in the research note. Each candidate receives 0-10 scores for:

- Usefulness: will the audience learn something practical?
- Novelty: is there a less obvious angle?
- Shareability: would someone save or share this with a classmate or colleague?
- Comment potential: can it invite thoughtful discussion without bait?
- Clarity: can the topic be explained simply?
- Credibility: are there enough source links to support the article?
- Visual potential: can the idea become a clean hero image, chart, or carousel?
- Personal-fit score: does it connect to Mohit's MBA, product, marketing, data science, consumer behavior, or AI workflow direction?

Additional drivers include recency, India relevance, business relevance, product/marketing lesson strength, and source availability. The selected topic should have the strongest combined score, not merely the freshest headline.

If performance analytics exist, the generator also considers:

- Past high-performing pillars.
- Past high-performing hook types.
- Formats that drove clicks or comments.
- Topics with strong LinkedIn clicks, comments, or journal visits.

This is a soft learning loop, not an autopilot. A strong current topic with better sources can still beat a historically strong category.

## Engagement Analytics

Manual analytics live in `content/analytics/`.

LinkedIn fields:

- `postSlug`
- `date`
- `topic`
- `pillar`
- `hookType`
- `format`
- `impressions`
- `reactions`
- `comments`
- `reposts`
- `clicks`
- `profileVisits`
- `engagementRate`
- `notes`

Journal fields:

- `articleSlug`
- `date`
- `pageViews`
- `readTime`
- `source`
- `clicksFromLinkedIn`
- `notes`

Start manually. Do not require API access. After each weekly post, add a row from LinkedIn analytics and a row from portfolio/Vercel analytics if available.

Run:

```bash
npm run analyze:content-performance
```

The script creates a report in `content/analytics/reports/` showing:

- Best-performing topics.
- Weak topics to learn from.
- Best hooks.
- Best pillars.
- Best formats.
- Journal traffic sources.
- Recommended next-week topic direction.

## Blog Writing Rules

- Open with a sharp, human hook, not a broad statement like "AI is changing the world."
- Use a short story or context before the analysis.
- Teach one useful idea clearly.
- Use short paragraphs and skim-friendly sections.
- Explain what happened, why it matters, the hidden lesson, India/MBA/student relevance, and what a student, PM, marketer, or business learner can take away.
- Separate fact from interpretation.
- Use "I read this as..." or similar phrasing when making a personal judgment.
- Avoid fake certainty, fake expertise, exaggerated predictions, and founder/influencer tone.
- Avoid robotic transitions, generic summaries, and repeated buzzwords.
- Make the article useful even if someone reads it in under 60 seconds.

Avoid these phrases unless quoting a source:

- "In today's fast-paced world"
- "AI is changing everything"
- "Game changer"
- "Revolutionizing"
- "Unlocking potential"
- "Dynamic landscape"

## Human Approval Rules

- `draft` means the piece is still being shaped and should not be public.
- `review` means the content is ready for Mohit's manual review.
- `published` means Mohit has approved it for the portfolio.
- LinkedIn drafts have their own approval status and must not inherit approval from the blog.
- No LinkedIn post, WhatsApp message, email, or social update should be sent automatically.
- If a claim is uncertain, either verify it with a stronger source or remove it.

## LinkedIn Draft Rules

LinkedIn drafts should adapt the portfolio article, not duplicate it.

- Start with a clean hook that would make a busy reader pause.
- Give short context without overexplaining.
- Share one main insight and 3 to 5 crisp supporting points.
- Link back to the full portfolio blog.
- End with one thoughtful engagement question.
- Use very limited hashtags, usually 2 to 4.
- Avoid engagement-bait, motivational filler, and exaggerated personal branding.

Good engagement questions include:

- What do you think this changes for Indian businesses?
- Where else do you see this pattern?
- Is this a product problem or a distribution problem?
- What would you watch next if you were analyzing this market?

The goal is thoughtful comments, not rage bait, hot takes, or forced virality.

Every weekly LinkedIn post should include:

- One thoughtful question.
- One clear discussion angle.
- No rage bait.
- No fake controversy.
- No auto-reply behavior.

## Future LinkedIn Comment Workflow

Do not auto-reply to LinkedIn comments yet.

A future workflow may:

1. Collect comments manually or through the official LinkedIn API if available and permitted.
2. Summarize the discussion themes.
3. Generate suggested replies in Mohit's tone.
4. Wait for Mohit's human approval.
5. Post only approved replies through official APIs.

Browser automation, scraping, cookies, saved sessions, or password access are not allowed for comments or posting.

Suggested replies should be thoughtful, concise, professional, and non-defensive. Avoid argumentative tone, fake authority, and forced agreement.

## Manual LinkedIn Posting

LinkedIn posting is manual and approval-first. The weekly generation workflow does not post to LinkedIn.

Workflow:

1. Weekly draft is generated into `content/linkedin-drafts/`.
2. Mohit reviews and edits the LinkedIn draft.
3. Mohit changes the draft frontmatter to `status: "approved"`.
4. Mohit runs the manual GitHub Action `Post Approved LinkedIn Draft`.
5. The action runs `scripts/post-to-linkedin.js` with the selected draft slug.
6. The script posts through the official LinkedIn Posts API only.
7. The script marks the local draft as `posted` only after LinkedIn returns success.

Required GitHub Actions secrets:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_AUTHOR_URN`
- `WEEKLY_INSIGHT_PORTFOLIO_BASE_URL`

Safety rules:

- Drafts with `status: "draft"` or `status: "review"` must not post.
- Drafts already marked `posted` must not post again.
- Browser automation, scraping, cookies, saved sessions, and password extraction are not allowed.
- LinkedIn credentials must come from official LinkedIn OAuth/API setup and be stored only in GitHub Actions secrets or local `.env.local`.

Full setup details are in `LINKEDIN_POSTING_SETUP.md`.

## Optional WhatsApp Notifications

WhatsApp notifications use `scripts/send-whatsapp-notification.js` and the official WhatsApp Business Cloud API. They are optional and non-blocking.

Required secrets:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TO_NUMBER`

Mohit's recipient number should be stored as:

```text
WHATSAPP_TO_NUMBER=917680030135
```

Notification points:

- After the weekly draft PR is created, the workflow can send: `Weekly insight draft is ready for review: {PR_LINK}`.
- After an approved LinkedIn draft is posted, the workflow can send: `Weekly insight published. Blog: {BLOG_URL}. LinkedIn: {LINKEDIN_URL}`.
- A failure notification type is available for future use: `Weekly insight workflow needs attention. Check GitHub Actions: {RUN_URL}`.

Safety rules:

- If WhatsApp credentials are missing, the script logs `WhatsApp notification skipped: missing configuration` and exits successfully.
- WhatsApp send failures are logged but do not fail the main workflow.
- The project must not use WhatsApp Web, browser automation, session cookies, QR-code scraping, or personal-session hacks.
- For production usage outside an active service window, Meta may require approved WhatsApp message templates.

Full setup details are in `WHATSAPP_NOTIFICATION_SETUP.md`.

## Image And Visual Rules

- Images must be AI-generated, self-created, original, public domain, or clearly licensed for use.
- Store image prompts, source links, usage notes, and alt text with the asset metadata.
- Avoid fake screenshots, misleading product visuals, or images that imply access to private information.
- Visuals should support the article's idea, not decorate it randomly.
- Use calm editorial visuals, diagrams, simple charts, or abstract business/product graphics where useful.
- Weekly drafts should include `portfolioHeroImagePrompt`, `linkedinImagePrompt`, `carouselPrompt`, `supportingVisualPrompts`, `carouselOutline`, `visualStyle`, `altText`, `imageGeneratedByAI`, `imageDisclosure`, `imageCredit`, `imageSource`, `imageLicense`, and `ogImage` fields.
- Default disclosure for generated visuals should be `imageGeneratedByAI: true` and `imageDisclosure: "AI-generated editorial visual"` or the structured equivalent used in frontmatter.
- Use `content/generated-assets/` for visual prompts and metadata. Use `public/blog-images/` only for final optimized image files that should render on the site.
- Do not scrape images from news sites, copy product screenshots, or use brand logos unless usage is clearly allowed.
- If no visual has been approved, leave `heroImage` blank; the article layout is designed to remain premium without an image.

Full visual rules are in `VISUAL_GUIDELINES.md`.

## Citation And Source Rules

- Every research-backed claim should be traceable to a stored source link.
- Store source title, URL, publisher, publication date when available, access date, and the claim it supports.
- Prefer paraphrasing over long quotes.
- Do not invent citations or cite a source that does not support the claim.
- If using a statistic, store the exact source and the context around the number.
- If sources disagree, note the uncertainty instead of forcing a single answer.

## Safety And Quality Checklist

Before a post moves to `review`, confirm:

- The opening hook is specific and worth reading.
- The post teaches something practical.
- The article avoids robotic tone and generic AI-newsletter language.
- It does not use vague lines like "AI is changing the world."
- It does not claim expertise Mohit has not earned.
- All factual claims have source links.
- No hallucinated facts, quotes, numbers, or companies are included.
- Images are AI-generated, self-created, public domain, or copyright-safe.
- The LinkedIn draft is shorter, sharper, and clearly linked to the full blog.
- Nothing is auto-posted or sent without approval.
