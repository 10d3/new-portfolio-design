import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import Script from 'next/script';

declare global {
  interface Window {
    plausible: any;
  }
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Herley's Portfolio",
  description:
    "Showcasing projects, skills, and achievements in web development and design.",
  keywords: [
    "Next.js Developer",
    "Frontend Developer",
    "JavaScript Developer",
    "React Developer",
    "UI/UX Designer",
    "Full Stack Developer",
    "Web Development",
    "Responsive Design",
    "Performance Optimization",
    "Marc-Herley Antoine Portfolio",
  ],
  openGraph: {
    title: "Herley's Portfolio",
    description:
      "Explore my projects, skills, and accomplishments in web development and design. Let's create something amazing together!",
    url: "https://amherley.dev/", // Replace with your actual portfolio URL
    siteName: "Herley's Portfolio",
    images: [
      {
        url: "https://amherley.dev/me.png", // Replace with the URL of your OpenGraph image
        width: 1200,
        height: 630,
        alt: "Herley's Portfolio - Web Development and Design",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Herley's Portfolio",
    description: "Discover web development projects, skills, and achievements.",
    creator: "@Kryptoeden7", // Replace with your Twitter handle
    site: "@Kryptoeden7",
    images: [
      {
        url: "https://amherley.dev/me.png", // Replace with the same OpenGraph image
        alt: "Herley's Portfolio - Web Development and Design",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex flex-col gap-12 max-w-2xl mx-auto",
          inter.className
        )}
      >
        <Script
          defer
          data-domain="amherley.dev"
          src="https://plausible.amherley.dev/js/script.hash.outbound-links.pageview-props.tagged-events.js"
        />
        <Script id="plausible-script">
          {`
            window.plausible = window.plausible || function() {
              (window.plausible.q = window.plausible.q || []).push(arguments)
            }
          `}
        </Script>

        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
