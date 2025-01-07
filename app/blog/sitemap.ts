import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { BASE_URL, formatDate } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();
  return posts.map((post) => {
    const publishedDate = new Date(post.metadata.publishedAt);

    // Format the date to ISO 8601 string
    const lastModified = publishedDate.toISOString();
    return {
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified,
    };
  });
}
