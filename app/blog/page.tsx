import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import Link from "next/link";

export const metadata = {
  title: "Tech Musings by 10D3",
  description: "Debugging life one blog post at a time—thoughts on software development, life, and the occasional infinite loop.",
  openGraph: {
    title: "Tech Musings by 10D3",
    description: "Debugging life one blog post at a time—thoughts on software development, life, and the occasional infinite loop.",
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
    description: "Debugging life one blog post at a time—thoughts on software, life, and the occasional infinite loop.",
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
  const posts = await getBlogPosts();

  return (
    <section className="flex min-h-screen flex-col gap-6 px-6 md:px-0">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">blog</h1>
      </BlurFade>
      {posts
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
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
                <p className="tracking-tight">{post.metadata.title}</p>
                <p className="h-6 text-xs text-muted-foreground">
                  {post.metadata.publishedAt}
                </p>
              </div>
            </Link>
          </BlurFade>
        ))}
    </section>
  );
}
