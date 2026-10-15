import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/data/blog";
import { BASE_URL } from "@/lib/utils";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const dbPosts = await db
      .select({
        slug: posts.slug,
        publishedAt: posts.publishedAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.published, true));

    if (dbPosts.length > 0) {
      return dbPosts.map((post) => {
        const dateObj = post.updatedAt ?? post.publishedAt ?? new Date();
        return {
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: new Date(dateObj).toISOString(),
        };
      });
    }
  } catch (err) {
    console.error("Failed to query posts from DB for sitemap:", err);
  }

  const staticPosts = await getBlogPosts();
  return staticPosts.map((post) => {
    const publishedDate = new Date(post.metadata.publishedAt);
    return {
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: publishedDate.toISOString(),
    };
  });
}
