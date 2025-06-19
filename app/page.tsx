import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { DailyAverage } from "@/components/shared/daily-average";
import { DevTools } from "@/components/shared/dev-tool";
import { ProjectCard } from "@/components/shared/project-card";
import { SpotifyNowPlaying } from "@/components/shared/spotify";
import { TopLanguages } from "@/components/shared/top-language";
import { TopProjects } from "@/components/shared/top-project";
import { TotalCodingTime } from "@/components/shared/total-coding-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { getWakatimeStatsAndProjects } from "@/lib/wakastat";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.04;

export default async function Home() {
  let wakatimeData;
  try {
    wakatimeData = await getWakatimeStatsAndProjects();
  } catch (e) {
    return <div className="text-red-500">Failed to load WakaTime stats.</div>;
  }
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
            {/* <BlurFade delay={BLUR_FADE_DELAY}>
              <Avatar className="size-28 ">
                <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </BlurFade> */}
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
        <BlurFade
          delay={BLUR_FADE_DELAY * 3.5}
          className="grid grid-rows-[auto_auto_auto] gap-4"
        >
          <div className="grid grid-cols-2 gap-2 md:gap-0 items-center">
            <SpotifyNowPlaying />
            <DailyAverage
              averageHours={wakatimeData.averageHours}
              averageMinutes={wakatimeData.averageMinutes}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-0 items-center">
            <TopLanguages languages={wakatimeData.languages} />
            <TotalCodingTime totalHours={wakatimeData.totalHours} />
          </div>
          <div className="grid grid-cols-2 gap-2 md:gap-0 items-center">
            <TopProjects projects={wakatimeData.projects} />
            <DevTools
              editor={wakatimeData.devTools?.editor}
              os={wakatimeData.devTools?.os}
            />
          </div>

          <div className="flex items-center justify-center gap-2 pt-4">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <h2 className="text-xs leading-relaxed text-muted-foreground">
            WakaTime installed since{" "}
            <span className="relative inline-block px-1">
              <span className="relative z-10 text-foreground font-medium">16 June 2025</span>
              <span
                className="absolute inset-0 bg-yellow-300/60 dark:bg-yellow-400/40 transform rotate-1"
                style={{
                  clipPath:
                    "polygon(0% 20%, 5% 0%, 95% 5%, 100% 25%, 95% 45%, 100% 65%, 95% 85%, 90% 100%, 10% 95%, 0% 75%)",
                  height: "120%",
                  top: "-10%",
                }}
              />
            </span>
          </h2>
        </div>
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
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              >
                <ProjectCard
                  href={project.href}
                  key={project.title}
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
      {/* <section id="aboutMe">
        <BlurFade inView delay={BLUR_FADE_DELAY}>
          <div className="mx-auto w-full max-w-2xl space-y-8">
            <div className="gap-2 flex justify-between flex-col-reverse">
              <div className="flex-col flex flex-1 space-y-1.5">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className="text-2xl font-bold tracking-tighter sm:text-3xl xl:text-5xl/none"
                  yOffset={8}
                  text={`Get to know more about me`}
                />
                <BlurFade inView delay={BLUR_FADE_DELAY * 2}>
                  <Markdown className="prose max-w-full text-pretty font-sans text-base text-muted-foreground dark:prose-invert">
                    {DATA.summary}
                  </Markdown>
                </BlurFade>
              </div>
              <BlurFade className="flex self-center" delay={BLUR_FADE_DELAY}>
                <Avatar className="size-64">
                  <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
                  <AvatarFallback>{DATA.initials}</AvatarFallback>
                </Avatar>
              </BlurFade>
            </div>
          </div>
        </BlurFade>
      </section> */}
    </main>
  );
}
