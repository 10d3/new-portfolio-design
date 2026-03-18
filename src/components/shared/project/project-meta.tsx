import { Project } from "@/db/schema"

interface ProjectMetaProps {
  project: Project
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export function ProjectMeta({ project }: ProjectMetaProps) {
  return (
    <div className="mt-8 pt-8 border-t border-border">
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6">
        <MetaItem label="Role" value={project.role as string} />
        <MetaItem label="Team" value={`${project.teamSize} Engineers`} />
        <MetaItem label="Timeline" value={project.dates} />
        <MetaItem
          label="Status"
          value={project.active ? "Live" : "Archived"}
        />
      </dl>
    </div>
  )
}
