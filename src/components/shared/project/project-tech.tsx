import { Project } from "@/db/schema"

interface ProjectTechProps {
  project: Project
}

export function ProjectTech({ project }: ProjectTechProps) {
  if (!project?.technologies?.length) return null

  return (
    <section className="mb-16">
      <h2 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-5">
        Tech Stack
      </h2>
      <div className="flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-mono font-medium tracking-wide bg-tag-bg text-tag-fg border border-border hover:border-foreground/30 transition-colors duration-200"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  )
}
