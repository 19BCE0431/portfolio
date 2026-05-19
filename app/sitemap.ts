import type { MetadataRoute } from "next";
import { archiveProjects } from "./data/archive";
import { getPublishedJournalPosts } from "./data/journal";

const siteUrl = "https://mohitsaikrishna.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/archive`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/journal`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/life`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
  ];

  const archiveRoutes: MetadataRoute.Sitemap = archiveProjects.map((project) => ({
    url: `${siteUrl}/archive/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const journalRoutes: MetadataRoute.Sitemap = getPublishedJournalPosts().map((post) => ({
    url: `${siteUrl}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: post.slug === "ai-business-infrastructure" ? 0.8 : 0.7,
  }));

  return [...staticRoutes, ...journalRoutes, ...archiveRoutes];
}
