# Agentic Content System

This is the internal architecture for future weekly AI-assisted portfolio writing. It is designed to help create thoughtful long-form portfolio blogs and shorter LinkedIn drafts without sounding automated, generic, or inflated.

No part of this system should auto-publish to the portfolio, LinkedIn, WhatsApp, email, or any other channel without Mohit's explicit review and approval.

## Folder Map

- `content/research-notes/` stores raw weekly research notes, source lists, topic candidates, and fact checks.
- `content/journal/` stores portfolio blog drafts and published long-form posts.
- `content/linkedin-drafts/` stores LinkedIn adaptations connected to a portfolio blog.
- `content/generated-assets/` stores AI-generated or copyright-safe visual briefs, prompts, licenses, alt text, and asset metadata.
- `scripts/generate-weekly-insight.js` creates one weekly research note, one portfolio blog draft, one LinkedIn draft, and one visual prompt file for review.

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
```

The generator writes files to:

- `content/research-notes/`
- `content/journal/`
- `content/linkedin-drafts/`
- `content/generated-assets/`

The default status is `review`. The script does not set anything to `published`, does not post to LinkedIn, and does not send WhatsApp messages.

Environment variables can be added through `.env` or `.env.local`. Use `.env.example` as the safe template. Real secrets must never be committed.

Without `OPENAI_API_KEY`, the script creates a conservative review scaffold from collected sources. With `OPENAI_API_KEY` and `--use-ai`, it can generate fuller prose while still keeping approval status locked to draft or review.

## Weekly Workflow

1. Research the week across AI, product, technology, business, marketing, consumer behavior, startups, and global product strategy.
2. Capture source links, publication dates, access dates, and the specific claims each source supports.
3. Shortlist 3 to 5 possible topics with a one-line thesis for each.
4. Score each topic for relevance, freshness, source quality, narrative potential, Indian/global business relevance, and practical learning value.
5. Select one topic for drafting only after the topic has a clear business, product, consumer, or strategy lesson.
6. Create a research note first, then draft the long-form portfolio article.
7. Fact-check all research-backed claims against stored source links.
8. Move the article to `review` status for human review.
9. Create a LinkedIn draft that links back to the portfolio article.
10. Publish only after Mohit approves the blog and the LinkedIn draft separately.

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
- It matters to MBA students, product managers, marketers, analysts, founders, or business-curious readers.
- It has a clear business, product, strategy, marketing, or consumer behavior lesson.
- It has a surprising angle beyond the obvious headline.
- It can connect India and global business context where useful.
- It can be explained with credible sources.
- It gives Mohit room for a grounded personal interpretation without pretending to be an expert.
- It does not feel like another generic AI trend summary.

## Blog Writing Rules

- Open with a sharp, human hook, not a broad statement like "AI is changing the world."
- Teach one useful idea clearly.
- Use short paragraphs and skim-friendly sections.
- Explain what happened, why it matters, the hidden lesson, and what a student, PM, marketer, or business learner can take away.
- Separate fact from interpretation.
- Use "I read this as..." or similar phrasing when making a personal judgment.
- Avoid fake certainty, fake expertise, exaggerated predictions, and founder/influencer tone.
- Avoid robotic transitions, generic summaries, and repeated buzzwords.
- Make the article useful even if someone reads it in under 60 seconds.

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
- End with a thoughtful question or reflection.
- Use very limited hashtags, usually 2 to 4.
- Avoid engagement-bait, motivational filler, and exaggerated personal branding.

## Image And Visual Rules

- Images must be AI-generated, self-created, original, public domain, or clearly licensed for use.
- Store image prompts, source links, usage notes, and alt text with the asset metadata.
- Avoid fake screenshots, misleading product visuals, or images that imply access to private information.
- Visuals should support the article's idea, not decorate it randomly.
- Use calm editorial visuals, diagrams, simple charts, or abstract business/product graphics where useful.

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
