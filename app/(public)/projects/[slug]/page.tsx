import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DATA } from "@/data/resume";
import "@/components/shared/blog/editor-block-styles.css";
import { ProjectNav } from "@/components/shared/project/project-nav"
import { ProjectHero } from "@/components/shared/project/project-hero"
import { ProjectMedia } from "@/components/shared/project/project-media"
import { ProjectMeta } from "@/components/shared/project/project-meta"
import { ProjectTech } from "@/components/shared/project/project-tech"
import { ProjectBody } from "@/components/shared/project/project-body"
import { ProjectHighlights } from "@/components/shared/project/project-highlights"
import { ProjectFooter } from "@/components/shared/project/project-footer"

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!project) return {};

  return {
    title: `${project.title} — ${DATA.name}`,
    description: project.metaDescription ?? project.description,
    openGraph: {
      title: project.title,
      description: project.metaDescription ?? project.description,
      images: project.imageUrl ? [{ url: project.imageUrl }] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!project) notFound();

  const challenges = (project.challenges as string[]) ?? [];
  const outcomes = (project.outcomes as string[]) ?? [];
  const gallery = (project.gallery as { url: string; caption?: string }[]) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Constrained layout container */}
      <div className="max-w-5xl mx-auto">
        <ProjectNav />

        <ProjectHero project={project} />
      </div>

      {/* Full-bleed media */}
      <div className="max-w-5xl mx-auto">
        <ProjectMedia project={project} />
      </div>

      {/* Two-column body layout */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Main content column */}
          <main className="flex-1 min-w-0">
            <ProjectTech project={project} />

            {project.body && (
              <section className="mb-16">
                <h2 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6">
                  About the Project
                </h2>
                <ProjectBody html={project.body} />
              </section>
            )}

            <ProjectHighlights project={project} />
          </main>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-10">
              <ProjectMeta project={project} />

              {/* Divider */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-4">
                  Links
                </p>
                <div className="flex flex-col gap-2">
                  {project.siteUrl && (
                    <a
                      href={project.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm text-foreground/70 hover:text-foreground group transition-colors duration-200"
                    >
                      <span>Live Site</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                        aria-hidden="true"
                      >
                        <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                      </svg>
                    </a>
                  )}
                  {project.sourceUrl && (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm text-foreground/70 hover:text-foreground group transition-colors duration-200"
                    >
                      <span>GitHub</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                        aria-hidden="true"
                      >
                        <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <ProjectFooter project={project} />
      </div>
    </div>
  )
}
