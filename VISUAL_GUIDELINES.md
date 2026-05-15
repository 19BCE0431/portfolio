# Visual Guidelines

Weekly journal posts should feel visually considered, but never careless with copyright or credibility. Typography alone is acceptable when there is no safe or useful visual.

## Core Rule

Use visuals only when they clarify the idea, improve recall, or make the article easier to share. Do not add images as decoration.

## Safe Visual Sources

Use one of these:

- AI-generated visuals created specifically for the article.
- Self-created charts, diagrams, timelines, tables, or sketches.
- Public-domain or clearly licensed images.
- External images only when source, license, and credit are stored in metadata.

Do not scrape images from news sites, brand pages, product launch pages, social media, or search results.

## Required Metadata

Every weekly draft should support:

- `portfolioHeroImagePrompt`
- `linkedinImagePrompt`
- `carouselPrompt`
- `visualStyle`
- `altText`
- `imageGeneratedByAI`
- `imageDisclosure`
- `imageSource`
- `imageCredit`
- `imageLicense`
- `ogImage`

Recommended default:

```yaml
imageGeneratedByAI: true
imageDisclosure:
  disclosureNote: "AI-generated editorial visual"
```

Leave `heroImage`, `ogImage`, `imageSource`, `imageCredit`, and `imageLicense` blank until an approved image exists.

## Portfolio Hero Visuals

Each article should generate one portfolio hero prompt.

Good styles:

- Premium editorial infographic
- Abstract market map
- Clean timeline graphic
- Muted economic diagram
- Cinematic product strategy visual
- Minimal business illustration
- Elegant data visualization

The hero should be calm, refined, and useful at article width. It should not look like a startup ad, a crypto graphic, or a generic AI thumbnail.

## LinkedIn Visuals

Generate one LinkedIn-friendly image prompt:

- Square or landscape composition.
- One clear central idea.
- Mobile-readable if text is included.
- Strong contrast without loud colors.
- Scroll-stopping through clarity, not gimmicks.
- Professional enough for MBA, product, marketing, and business audiences.

Avoid small labels, dense charts, thin unreadable text, or cluttered diagrams.

## Carousel Strategy

Use a carousel only when the topic has a clean sequence or teachable structure.

Recommended 5-7 slide outline:

1. Hook
2. Context
3. What happened
4. Hidden business lesson
5. Why it matters
6. Key takeaway
7. Full article CTA

Carousel slides should use one idea per slide. Do not overload them with paragraphs.

## What To Avoid

Avoid:

- Robot faces
- Neon AI brains
- Fake dashboard screenshots
- Fake newspaper clippings
- Fake brand logos
- Copied brand assets
- Product screenshots unless clearly allowed
- Real people's likeness
- Cluttered diagrams
- Childish infographic style
- Misleading visuals that imply evidence, endorsement, or access the article does not have

## When To Use Charts Instead Of Images

Use a chart, diagram, or table when the article explains:

- A comparison
- A process
- A funnel or workflow
- A market map
- A timeline
- A before/after shift
- A trade-off or decision tree

Charts must be source-backed. Do not invent data.

## Alt Text Rules

Alt text should describe the visual clearly and briefly.

Good:

`Abstract editorial visual showing market signals flowing into product decisions and consumer behavior.`

Avoid:

`AI business product strategy marketing futuristic innovation image.`

## OG Image Rules

Use an OG image when the article will be shared on LinkedIn.

Recommended size:

`1200x630`

The OG image should be readable at preview size and should not include logos, fake UI, copyrighted images, or unsupported claims.

## Storage

Use:

- `content/generated-assets/` for prompts, carousel outlines, source notes, license notes, and metadata.
- `public/blog-images/` for final optimized images that should render on the live site.

Do not commit huge images unnecessarily. Prefer optimized `.webp` or `.jpg`; use `.png` only for sharp diagrams or transparency.

## Publishing Checklist

Before publishing:

- The visual is AI-generated, self-created, public domain, or clearly licensed.
- `imageGeneratedByAI` and `imageDisclosure` are accurate.
- External image source, credit, and license are stored when relevant.
- No scraped news image is used.
- No brand logo, screenshot, or likeness is used without permission.
- Alt text is present.
- The visual does not imply evidence or endorsement that the article does not contain.
- The image file is optimized.
