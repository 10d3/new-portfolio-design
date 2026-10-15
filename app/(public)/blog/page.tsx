import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import Link from "next/link";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const metadata = {
  title: "Tech Musings by 10D3",
  description:
    "Debugging life one blog post at a time—thoughts on software development, life, and the occasional infinite loop.",
  keywords: [
    "Web Development Tips",
    "Next.js Tutorials",
    "JavaScript Best Practices",
    "React.js Guides",
    "UI/UX Design Principles",
    "Frontend Development",
    "Performance Optimization Techniques",
    "Responsive Web Design",
    "SEO Strategies for Developers",
    "Building E-commerce Websites",
  ],
  openGraph: {
    title: "Tech Musings by 10D3",
    description:
      "Debugging life one blog post at a time—thoughts on software development, life, and the occasional infinite loop.",
    url: "https://amherley.dev/", // Replace with your website URL
    siteName: "Tech Musings by 10D3",
    images: [
      {
        url: "https://amherley.dev/blog.png", // Replace with your OpenGraph image URL
        width: 1200,
        height: 630,
        alt: "Tech Musings by 10D3 - Debugging life one blog post at a time",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Musings by 10D3",
    description:
      "Debugging life one blog post at a time—thoughts on software, life, and the occasional infinite loop.",
    creator: "@Kryptoeden7", // Replace with your Twitter handle
    site: "@Kryptoeden7",
    images: [
      {
        url: "https://amherley.dev/blog.png", // Replace with the same OpenGraph image
        alt: "Tech Musings by 10D3 - Debugging life with code.",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
  let postList: {
    title: string;
    slug: string;
    publishedAt: string;
  }[] = [];

  try {
    const dbPosts = await db
      .select({
        title: posts.title,
        slug: posts.slug,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.publishedAt), desc(posts.createdAt));

    if (dbPosts.length > 0) {
      postList = dbPosts.map((p) => {
        const dateObj = p.publishedAt ?? p.createdAt;
        const dateStr = dateObj
          ? new Date(dateObj).toISOString().split("T")[0]
          : "";
        return {
          title: p.title,
          slug: p.slug,
          publishedAt: dateStr,
        };
      });
    }
  } catch (err) {
    console.error("Failed to fetch blog posts from DB, falling back to static files:", err);
  }

  // Graceful fallback to static MDX files
  if (postList.length === 0) {
    const staticPosts = await getBlogPosts();
    postList = staticPosts.map((post) => ({
      title: post.metadata.title,
      slug: post.slug,
      publishedAt: post.metadata.publishedAt,
    }));
  }

  return (
    <section className="flex min-h-screen flex-col gap-6 px-6 md:px-0">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">blog</h1>
      </BlurFade>
      {postList
        .sort((a, b) => {
          if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
            return -1;
          }
          return 1;
        })
        .map((post, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
            <Link
              className="flex flex-col space-y-1 mb-4"
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col">
                <p className="tracking-tight">{post.title}</p>
                <p className="h-6 text-xs text-muted-foreground">
                  {post.publishedAt}
                </p>
              </div>
            </Link>
          </BlurFade>
        ))}
    </section>
  );
}
