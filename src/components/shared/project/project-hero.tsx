"use client"

import { ArrowUpRight, ExternalLink, Github } from "lucide-react"
// import type { Project } from "@/lib/project-data"
import { cn } from "@/lib/utils"
import { Project } from "@/db/schema"

interface ProjectHeroProps {
  project: Project
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <section className="relative pt-12 pb-8 md:pt-12 md:pb-8">
      {/* Top meta row */}
      <div className="flex items-center gap-3 mb-10">
        <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          Case Study
        </span>
        <span className="w-8 h-px bg-border" />
        <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
          {project.dates}
        </span>
        {project.active && (
          <>
            <span className="w-8 h-px bg-border" />
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-xs tracking-widest uppercase text-emerald-500">
                Live
              </span>
            </span>
          </>
        )}
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-balance text-foreground leading-[1.05] mb-6">
        {project.title}
      </h1>

      {/* Description */}
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-12 text-pretty">
        {project.description}
      </p>

      {/* CTA links */}
      <div className="flex flex-wrap items-center gap-4">
        {project.siteUrl && (
          <a
            href={project.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-sm",
              "bg-foreground text-background text-sm font-medium",
              "hover:opacity-80 transition-opacity duration-200"
            )}
          >
            View Live Site
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-sm",
              "border border-border text-foreground text-sm font-medium",
              "hover:bg-secondary transition-colors duration-200"
            )}
          >
            <Github className="w-3.5 h-3.5" />
            Source Code
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </section>
  )
}
