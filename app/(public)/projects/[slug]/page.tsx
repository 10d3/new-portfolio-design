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

const CONTAINER = "max-w-2xl mx-auto px-5 sm:px-6"

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-background px-1 md:px-0">
      {/* Constrained layout container */}
      {/* Nav */}
      <div className={CONTAINER}>
        <ProjectNav />
      </div>

      {/* Hero */}
      <div className={CONTAINER}>
        <ProjectHero project={project} />
      </div>

      {/* Media — same constraint, no bleed */}
      <div className={CONTAINER}>
        <ProjectMedia project={project} />
      </div>

      {/* Meta strip — horizontal grid within the column */}
      <div className={CONTAINER}>
        <ProjectMeta project={project} />
      </div>

      {/* Tech stack */}
      <div className={CONTAINER}>
        <div className="mt-10">
          <ProjectTech project={project} />
        </div>
      </div>

      {/* Body */}
      {project.body && (
        <div className={CONTAINER}>
          <section className="mt-2 mb-16">
            <h2 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6">
              About the Project
            </h2>
            <ProjectBody html={project.body} />
          </section>
        </div>
      )}

      {/* Challenges & Outcomes */}
      <div className={CONTAINER}>
        <ProjectHighlights project={project} />
      </div>

      {/* Footer */}
      <div className={CONTAINER}>
        <ProjectFooter project={project} />
      </div>
    </div>
  )
}
