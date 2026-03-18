import { Project } from "@/db/schema"
import { cn } from "@/lib/utils"

interface ProjectHighlightsProps {
  project: Project
}

function HighlightBlock({
  label,
  items,
  variant,
}: {
  label: string
  items: string[]
  variant: "challenges" | "outcomes"
}) {
  if (!items.length) return null

  return (
    <div className="flex-1 min-w-0">
      <h2 className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-5">
        {label}
      </h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span
              className={cn(
                "mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full",
                variant === "challenges" ? "bg-amber-500/70" : "bg-emerald-500/70"
              )}
            />
            <p className="text-sm text-foreground/80 leading-relaxed">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProjectHighlights({ project }: ProjectHighlightsProps) {
  if (!project.challenges?.length && !project.outcomes?.length) return null

  return (
    <section className="my-16 p-6 sm:p-8 rounded-sm border border-border bg-card">
      <div className="flex flex-col gap-10">
        <HighlightBlock
          label="Challenges"
          items={project.challenges ?? []}
          variant="challenges"
        />
        {(project.challenges?.length ?? 0) > 0 && (project.outcomes?.length ?? 0) > 0 && (
          <div className="h-px bg-border w-full" />
        )}
        <HighlightBlock
          label="Outcomes"
          items={project.outcomes ?? []}
          variant="outcomes"
        />
      </div>
    </section>
  )
}
