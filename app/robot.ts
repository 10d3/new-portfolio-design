import { BASE_URL } from "@/lib/utils";
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
    sitemap:[`${BASE_URL || "http://localhost:3000"}/sitemap.xml`, `${BASE_URL || "http://localhost:3000"}/blog/sitemap.xml`],
  };
}
