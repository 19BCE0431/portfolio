# Visual Guidelines

Weekly blogs can use visuals, but only when they improve comprehension or make the article feel more polished. The default should be thoughtful restraint: typography alone is acceptable when there is no safe or useful image.

## Safe Visual Sources

Use one of these:

- AI-generated visuals created specifically for the article.
- Self-created charts, diagrams, tables, or screenshots from your own work.
- Public-domain or clearly licensed images.
- External images only when the source, license, and credit are stored in the post metadata.

Do not scrape images from news sites, brand pages, social media, or product launches.

## When To Use AI-Generated Visuals

AI-generated visuals are useful when the topic is conceptual:

- AI changing workflows
- Product strategy lessons
- Business model shifts
- Consumer behavior patterns
- Market structure or decision-making themes

Recommended style:

- Premium
- Editorial
- Abstract
- Business/product/AI inspired
- Modern and restrained
- Warm neutral or balanced color palette
- Thin lines, subtle depth, clean composition

Avoid:

- Cartoonish illustrations
- Fake corporate stock-photo scenes
- Neon, cyberpunk, crypto, or gaming aesthetics
- Fake dashboards, fake product screenshots, or invented brand interfaces
- Real logos unless usage is clearly allowed
- Faces or people that imply a real person or endorsement

## When To Use Charts Instead Of Images

Use a chart, diagram, or table when the article explains:

- A comparison
- A process
- A funnel or workflow
- A market map
- A before/after shift
- A trade-off or decision tree

Charts should be simple, source-backed, and labeled clearly. Do not invent data.

## Metadata Required For Every Visual

Each published article should include:

- `heroImage`
- `heroImagePrompt`
- `supportingVisualPrompts`
- `imageCredit`
- `imageSource`
- `imageLicense`
- `altText`
- `ogImage`

If a field does not apply yet, leave it blank until the visual is approved.

## Alt Text Rules

Alt text should describe the image clearly without stuffing keywords.

Good:

`Abstract editorial visual showing AI signals flowing into product decisions and business outcomes.`

Avoid:

`AI business product strategy marketing futuristic innovation image.`

## Image Storage

Use:

- `public/blog-images/` for final optimized images that render on the site.
- `content/generated-assets/` for prompts, drafts, source notes, license notes, and metadata.

Do not commit huge images unnecessarily. Optimize images before adding them.

Recommended formats:

- `.webp` or optimized `.jpg` for article hero images.
- `.png` only when transparency or sharp diagrams require it.

## OG Image Recommendation

Use an OG image when the article will be shared on LinkedIn. The image should be readable and visually calm at preview size.

Recommended size:

`1200x630`

The OG image should not include copyrighted logos, fake product UI, misleading screenshots, or claims not supported by the article.

## Copyright Safety Checklist

Before publishing:

- The image is AI-generated, self-created, public domain, or clearly licensed.
- External images have source, license, and credit stored.
- No scraped news images are used.
- No brand logos or screenshots are used unless clearly allowed.
- Alt text is present.
- The visual does not imply endorsement, access, or evidence that the article does not have.
- The image file is optimized and not unnecessarily large.
