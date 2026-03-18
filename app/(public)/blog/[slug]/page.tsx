import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/components/shared/blog/editor-block-styles.css";
import { Editor } from "@/components/shared/blog/editor";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata | undefined> {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post) return {};

  const ogImage = post.imageUrl
    ? post.imageUrl
    : `${DATA.url}/og?title=${post.title}`;

  return {
    title: post.title,
    description: post.summary,
    keywords: post.keywords ?? [],
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      url: `${DATA.url}/blog/${post.slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!post || !post.published) notFound();

  return (
    <section
      id="blog"
      className="flex min-h-screen flex-col gap-6 px-6 pb-6 md:px-0"
    >
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.publishedAt?.toISOString(),
            description: post.summary,
            image: post.imageUrl
              ? post.imageUrl
              : `${DATA.url}/og?title=${post.title}`,
            url: `${DATA.url}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: DATA.name,
            },
          }),
        }}
      />

      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.title}
      </h1>

      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {post.publishedAt ? formatDate(post.publishedAt.toISOString()) : ""}
        </p>
      </div>

      {/* Render the HTML produced by the Tiptap editor */}
      <Editor content={post.content ?? ""} isReadOnly />
    </section>
  );
}
