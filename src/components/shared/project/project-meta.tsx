import { Project } from "@/db/schema"

interface ProjectMetaProps {
  project: Project
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-5 border-b border-border last:border-b-0">
      <dt className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

export function ProjectMeta({ project }: ProjectMetaProps) {
  return (
    <aside className="w-full">
      <dl className="border-t border-border divide-y-0">
        <MetaItem label="Role" value={project.role as string} />
        <MetaItem label="Team Size" value={`${project.teamSize} Engineers`} />
        <MetaItem label="Timeline" value={project.dates as string} />
        <MetaItem label="Status" value={project.active ? "Active / In Production" : "Archived"} />
      </dl>
    </aside>
  )
}
