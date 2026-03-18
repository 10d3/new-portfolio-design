import { ArrowUpRight } from "lucide-react"
import type { Project } from "@/lib/project-data"

interface ProjectFooterProps {
  project: Project
}

export function ProjectFooter({ project }: ProjectFooterProps) {
  return (
    <footer className="mt-24 pt-12 border-t border-border pb-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-2">
            Interested in working together?
          </p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">
            Let&apos;s build something great.
          </p>
        </div>
        <a
          href="mailto:hello@example.com"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground border-b border-foreground/30 hover:border-foreground pb-0.5 transition-colors duration-200 group"
        >
          Get in touch
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </a>
      </div>

      {project.siteUrl && (
        <div className="mt-10 font-mono text-xs text-muted-foreground">
          <span className="opacity-50">↗</span>{" "}
          <a
            href={project.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
          >
            {project.siteUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>
      )}
    </footer>
  )
}
