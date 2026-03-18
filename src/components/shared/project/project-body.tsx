import { Editor } from "../blog/editor"

interface ProjectBodyProps {
  html: string
}

export function ProjectBody({ html }: ProjectBodyProps) {
  return (
    <Editor content={html} isReadOnly />
  )
}
