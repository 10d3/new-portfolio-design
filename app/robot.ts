import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin",
      },
    ],
    sitemap:[`${process.env.VERCEL_URL || "http://localhost:3000"}/sitemap.xml`, `${process.env.VERCEL_URL || "http://localhost:3000"}/blog/sitemap.xml`],
  };
}
