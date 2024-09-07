import type { MetadataRoute } from 'next'
import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
// import { BASE_URL } from '@/app/lib/constants'


const BASE_URL = `${process.env.VERCEL_URL || "http://localhost:3000"}`
// export async function generateSitemaps() {
//   // Fetch the total number of products and calculate the number of sitemaps needed
//   return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
// }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Google's limit is 50,000 URLs per sitemap
//   const start = id * 50000
//   const end = start + 50000
  const posts = await getBlogPosts();
//   const filteredPosts = posts.filter((post, index) => index >= start && index < end);
  return posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: formatDate(post.metadata.publishedAt),
  }))
}