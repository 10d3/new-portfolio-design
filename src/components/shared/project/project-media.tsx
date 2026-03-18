"use client"

import { useState } from "react"
import Image from "next/image"
import { Project } from "@/db/schema"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectMediaProps {
  project: Project
}

export function ProjectMedia({ project }: ProjectMediaProps) {
  const [videoPlaying, setVideoPlaying] = useState(false)

  if (!project.imageUrl && !project.videoUrl) return null

  return (
    <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-secondary border border-border my-12 md:my-16 group">
      {project.videoUrl && !videoPlaying ? (
        <>
          {project.imageUrl && (
            <Image
              src={project.imageUrl}
              alt={`${project.title} preview`}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
            <button
              onClick={() => setVideoPlaying(true)}
              aria-label="Play project demo video"
              className={cn(
                "group/btn flex items-center justify-center",
                "w-16 h-16 rounded-full border border-foreground/20 bg-background/80 backdrop-blur-sm",
                "hover:bg-background hover:scale-110 transition-all duration-300"
              )}
            >
              <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
            </button>
          </div>
        </>
      ) : videoPlaying && project.videoUrl ? (
        <iframe
          src={`${project.videoUrl}?autoplay=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen"
          title={`${project.title} demo`}
        />
      ) : project.imageUrl ? (
        <Image
          src={project.imageUrl}
          alt={`${project.title} preview`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          priority
        />
      ) : null}

      {/* Corner label */}
      <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-widest uppercase text-foreground/60 bg-background/70 backdrop-blur-sm px-2 py-1 rounded-sm border border-border/50">
        Project Preview
      </div>
    </div>
  )
}
