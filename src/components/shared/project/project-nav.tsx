"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ProjectNav() {
  return (
    <nav className="flex items-center justify-between py-2 border-b border-border">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
        All Projects
      </Link>
      <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground select-none">
        Portfolio
      </span>
    </nav>
  )
}
