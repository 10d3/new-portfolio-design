import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/shared/project-card";
import { DATA } from "@/data/resume";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

export const revalidate = 60;

export default async function Home() {
  let dbProjects: (typeof projects.$inferSelect)[] = [];
  try {
    dbProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.active, true))
      .orderBy(desc(projects.createdAt));
  } catch {
    // DB not yet configured — graceful fallback to static data below
  }

  const hasDbProjects = dbProjects.length > 0;

  return (
    <main className="flex min-h-screen flex-col gap-6 px-6 md:px-0">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="gap-2 flex justify-between">
            <div className="flex-col flex flex-1 space-y-1.5">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
                yOffset={8}
                text={`Hi, I'm ${DATA.name.split(" ")[0]}`}
              />
              <BlurFadeText
                className="max-w-[600px] md:text-xl"
                delay={BLUR_FADE_DELAY}
                text={DATA.description}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">About</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <Markdown className="prose max-w-full text-pretty font-sans text-sm text-muted-foreground dark:prose-invert">
            {DATA.summary}
          </Markdown>
        </BlurFade>
      </section>

      <section id="projects">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  My Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Check out my latest work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  I&apos;ve worked on a variety of projects, from simple
                  websites to complex web applications. Here are a few of my
                  favorites.
                </p>
              </div>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto">
            {hasDbProjects
              ? dbProjects.map((project, id) => (
                  <BlurFade
                    key={project.id}
                    delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                  >
                    <ProjectCard
                      href={`/projects/${project.slug}`}
                      title={project.title}
                      description={project.description}
                      dates={project.dates}
                      tags={project.technologies ?? []}
                      image={project.imageUrl ?? ""}
                      video={project.videoUrl ?? ""}
                      links={[
                        ...(project.siteUrl
                          ? [{ type: "Website", href: project.siteUrl }]
                          : []),
                        ...(project.sourceUrl
                          ? [{ type: "Source", href: project.sourceUrl }]
                          : []),
                      ]}
                    />
                  </BlurFade>
                ))
              : DATA.projects.map((project, id) => (
                  <BlurFade
                    key={project.title}
                    delay={BLUR_FADE_DELAY * 12 + id * 0.05}
                  >
                    <ProjectCard
                      href={project.href}
                      title={project.title}
                      description={project.description}
                      dates={project.dates}
                      tags={project.technologies}
                      image={project.image}
                      video={project.video}
                      links={project.links}
                    />
                  </BlurFade>
                ))}
          </div>
        </div>
      </section>
    </main>
  );
}
