interface ProjectBodyProps {
  html: string
}

export function ProjectBody({ html }: ProjectBodyProps) {
  return (
    <div
      className="prose-project"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
