import fs from "node:fs";
import path from "node:path";

export type JournalStatus = "draft" | "review" | "pending_review" | "published";

export type JournalCategory =
  | "AI & Business"
  | "Product Strategy"
  | "Indian Consumer Behavior"
  | "Market Signals"
  | "Brand & Marketing Lessons"
  | "Business History with Modern Relevance"
  | "MBA Learning Notes"
  | "Data Science Applied to Decisions";

export type JournalSource = {
  title: string;
  url: string;
  publisher?: string;
  datePublished?: string;
  accessed?: string;
  claimSupported?: string;
};

export type JournalVisualPrompt = {
  prompt: string;
  altText?: string;
  suggestedUse?: string;
};

export type JournalImageDisclosure = {
  recommendedUse?: string;
  copyrightStatus?: string;
  disclosureNote?: string;
};

export type JournalLinkedInShortPost = {
  draftPath?: string;
  status?: "draft" | "linkedin_manual_ready" | string;
  engagementQuestion?: string;
};

export type JournalBlock =
  | { type: "heading"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type JournalPost = {
  title: string;
  slug: string;
  date: string;
  status: JournalStatus;
  category: JournalCategory;
  tags: string[];
  summary: string;
  heroImage?: string;
  portfolioHeroImagePrompt?: string;
  heroImagePrompt?: string;
  linkedinImagePrompt?: string;
  linkedinImageAltText?: string;
  carouselPrompt?: string;
  carouselOutline: string[];
  supportingVisualPrompts: JournalVisualPrompt[];
  visualStyle?: string;
  suggestedVisualStyle?: string;
  imageGeneratedByAI?: boolean;
  imageDisclosure?: JournalImageDisclosure;
  imageCredit?: string;
  imageSource?: string;
  imageLicense?: string;
  altText?: string;
  ogImage?: string;
  heroImageAlt?: string;
  sourceLinks: JournalSource[];
  keyInsight?: string;
  readingTime: string;
  canonicalUrl?: string;
  approvalStatus?: string;
  linkedinShortPost?: JournalLinkedInShortPost;
  body: string;
  blocks: JournalBlock[];
};

export const journalCategories: JournalCategory[] = [
  "AI & Business",
  "Product Strategy",
  "Indian Consumer Behavior",
  "Market Signals",
  "Brand & Marketing Lessons",
  "Business History with Modern Relevance",
  "MBA Learning Notes",
  "Data Science Applied to Decisions",
];

const JOURNAL_DIR = path.join(process.cwd(), "content", "journal");
const NON_POST_FILES = new Set(["README.md", "blog-post.schema.md"]);

export function getAllJournalPosts() {
  if (!fs.existsSync(JOURNAL_DIR)) {
    return [];
  }

  return fs
    .readdirSync(JOURNAL_DIR)
    .filter((file) => file.endsWith(".md") && !NON_POST_FILES.has(file))
    .map((file) => readJournalPost(path.join(JOURNAL_DIR, file)))
    .sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
}

export function getPublishedJournalPosts() {
  return getAllJournalPosts().filter((post) => post.status === "published");
}

export function getVisibleJournalPosts() {
  const posts = getAllJournalPosts();

  if (process.env.NODE_ENV === "production") {
    return posts.filter((post) => post.status === "published");
  }

  return posts;
}

export function getVisibleJournalPost(slug: string) {
  return getVisibleJournalPosts().find((post) => post.slug === slug);
}

export function getPublishedJournalPost(slug: string) {
  return getPublishedJournalPosts().find((post) => post.slug === slug);
}

export function getRecentPublishedJournalPosts(limit = 3) {
  return getPublishedJournalPosts().slice(0, limit);
}

export function getRelatedJournalPosts(post: JournalPost, limit = 2) {
  return getPublishedJournalPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((first, second) => {
      const firstScore = first.category === post.category ? 1 : 0;
      const secondScore = second.category === post.category ? 1 : 0;
      return secondScore - firstScore;
    })
    .slice(0, limit);
}

function readJournalPost(filePath: string): JournalPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, body } = parseMarkdownWithFrontmatter(raw);
  const slug = String(frontmatter.slug || path.basename(filePath, ".md")).trim();
  const title = String(frontmatter.title || titleFromSlug(slug)).trim();
  const cleanedBody = removeDuplicateTitle(body, title);

  return {
    title,
    slug,
    date: String(frontmatter.date || "").trim(),
    status: normalizeStatus(frontmatter.status),
    category: normalizeCategory(frontmatter.category, frontmatter.tags),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    summary: String(frontmatter.summary || "").trim(),
    heroImage: String(frontmatter.heroImage || "").trim(),
    portfolioHeroImagePrompt: String(frontmatter.portfolioHeroImagePrompt || "").trim(),
    heroImagePrompt: String(frontmatter.heroImagePrompt || "").trim(),
    linkedinImagePrompt: String(frontmatter.linkedinImagePrompt || "").trim(),
    linkedinImageAltText: String(frontmatter.linkedinImageAltText || "").trim(),
    carouselPrompt: String(frontmatter.carouselPrompt || "").trim(),
    carouselOutline: Array.isArray(frontmatter.carouselOutline)
      ? frontmatter.carouselOutline
      : [],
    supportingVisualPrompts: Array.isArray(frontmatter.supportingVisualPrompts)
      ? frontmatter.supportingVisualPrompts
      : [],
    visualStyle: String(frontmatter.visualStyle || "").trim(),
    suggestedVisualStyle: String(frontmatter.suggestedVisualStyle || "").trim(),
    imageGeneratedByAI: parseBoolean(frontmatter.imageGeneratedByAI),
    imageDisclosure: isRecord(frontmatter.imageDisclosure)
      ? {
          recommendedUse: String(frontmatter.imageDisclosure.recommendedUse || "").trim(),
          copyrightStatus: String(frontmatter.imageDisclosure.copyrightStatus || "").trim(),
          disclosureNote: String(frontmatter.imageDisclosure.disclosureNote || "").trim(),
        }
      : undefined,
    imageCredit: String(frontmatter.imageCredit || "").trim(),
    imageSource: String(frontmatter.imageSource || "").trim(),
    imageLicense: String(frontmatter.imageLicense || "").trim(),
    altText: String(frontmatter.altText || "").trim(),
    ogImage: String(frontmatter.ogImage || "").trim(),
    heroImageAlt: String(frontmatter.heroImageAlt || "").trim(),
    sourceLinks: Array.isArray(frontmatter.sourceLinks)
      ? frontmatter.sourceLinks
      : [],
    keyInsight: String(frontmatter.keyInsight || "").trim(),
    readingTime:
      String(frontmatter.readingTime || "").trim() ||
      `${estimateReadingTime(cleanedBody)} min read`,
    canonicalUrl: String(frontmatter.canonicalUrl || "").trim(),
    approvalStatus: String(frontmatter.approvalStatus || "").trim(),
    linkedinShortPost: isRecord(frontmatter.linkedinShortPost)
      ? {
          draftPath: String(frontmatter.linkedinShortPost.draftPath || "").trim(),
          status: String(frontmatter.linkedinShortPost.status || "").trim(),
          engagementQuestion: String(frontmatter.linkedinShortPost.engagementQuestion || "").trim(),
        }
      : undefined,
    body: cleanedBody,
    blocks: markdownToBlocks(cleanedBody),
  };
}

function parseMarkdownWithFrontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: markdown };
  }

  return {
    frontmatter: parseFrontmatter(match[1]),
    body: match[2],
  };
}

function parseFrontmatter(raw: string) {
  const data: Record<string, unknown> = {};
  const lines = raw.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1];
    const value = match[2];

    if (key === "tags" || key === "hashtags") {
      const items: string[] = [];
      while (/^\s+-\s+/.test(lines[index + 1] || "")) {
        index += 1;
        items.push(stripYamlValue(lines[index].replace(/^\s+-\s+/, "")));
      }
      data[key] = items;
      continue;
    }

    if (key === "sourceLinks" || key === "supportingVisualPrompts") {
      const items: Record<string, string>[] = [];
      while (/^\s+/.test(lines[index + 1] || "")) {
        index += 1;
        const itemLine = lines[index];
        const itemStart = itemLine.match(/^\s+-\s+([A-Za-z0-9_]+):\s*(.*)$/);
        if (itemStart) {
          items.push({
            [itemStart[1]]: stripYamlValue(itemStart[2]),
          });
          continue;
        }

        const nested = itemLine.match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
        if (nested && items.length) {
          items[items.length - 1] = {
            ...items[items.length - 1],
            [nested[1]]: stripYamlValue(nested[2]),
          };
        }
      }
      data[key] = items;
      continue;
    }

    if (key === "carouselOutline") {
      const items: string[] = [];
      while (/^\s+-\s+/.test(lines[index + 1] || "")) {
        index += 1;
        items.push(stripYamlValue(lines[index].replace(/^\s+-\s+/, "")));
      }
      data[key] = items;
      continue;
    }

    if (key === "linkedinShortPost" || key === "imageDisclosure") {
      const nestedObject: Record<string, string> = {};
      while (/^\s+/.test(lines[index + 1] || "")) {
        index += 1;
        const nested = lines[index].match(/^\s+([A-Za-z0-9_]+):\s*(.*)$/);
        if (nested) {
          nestedObject[nested[1]] = stripYamlValue(nested[2]);
        }
      }
      data[key] = nestedObject;
      continue;
    }

    data[key] = stripYamlValue(value);
  }

  return data;
}

function parseBoolean(value: unknown) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripYamlValue(value: string) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function normalizeStatus(value: unknown): JournalStatus {
  if (value === "published" || value === "review" || value === "pending_review" || value === "draft") {
    return value;
  }

  return "draft";
}

function normalizeCategory(value: unknown, tags: unknown): JournalCategory {
  const explicitCategory = String(value || "").trim();
  if (journalCategories.includes(explicitCategory as JournalCategory)) {
    return explicitCategory as JournalCategory;
  }

  const text = `${String(value || "")} ${Array.isArray(tags) ? tags.join(" ") : ""}`.toLowerCase();

  if (text.includes("history")) return "Business History with Modern Relevance";
  if (text.includes("marketing") || text.includes("brand")) return "Brand & Marketing Lessons";
  if (text.includes("consumer") || text.includes("india") || text.includes("retail") || text.includes("ecommerce")) {
    return "Indian Consumer Behavior";
  }
  if (text.includes("mba")) return "MBA Learning Notes";
  if (text.includes("market") || text.includes("signal")) return "Market Signals";
  if (text.includes("product")) return "Product Strategy";
  if (text.includes("data") || text.includes("automation")) return "Data Science Applied to Decisions";
  return "AI & Business";
}

function removeDuplicateTitle(body: string, title: string) {
  const lines = body.trim().split(/\r?\n/);
  if (lines[0]?.replace(/^#\s+/, "").trim() === title) {
    return lines.slice(1).join("\n").trim();
  }

  return body.trim();
}

function markdownToBlocks(markdown: string): JournalBlock[] {
  const blocks: JournalBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line || line.startsWith("<!--")) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", text: line.replace(/^##\s+/, "") });
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
    if (image) {
      flushParagraph();
      flushList();

      const nextLine = lines[index + 1]?.trim() || "";
      const caption = italicCaptionText(nextLine);
      if (caption) {
        index += 1;
      }

      blocks.push({
        type: "image",
        src: image[2],
        alt: image[1],
        caption,
      });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.replace(/^-\s+/, ""));
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function italicCaptionText(line: string) {
  const match = line.match(/^[_*]([^_*].*?)[_*]$/);
  return match?.[1]?.trim();
}

function estimateReadingTime(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}
