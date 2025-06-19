"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  name: string;
  percent: number;
  hours: number;
  minutes: number;
  type?: string;
}

interface TopProjectsProps {
  projects?: Project[];
  isLoading?: boolean;
}

export function TopProjects({ projects, isLoading = false }: TopProjectsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mock data - Top 3 projects
  const mockProjects: Project[] = [
    {
      name: "portfolio-website",
      percent: 32.4,
      hours: 28,
      minutes: 45,
      type: "Web",
    },
    { name: "ai-chat-app", percent: 24.7, hours: 21, minutes: 12, type: "AI" },
    {
      name: "e-commerce-api",
      percent: 18.9,
      hours: 16,
      minutes: 33,
      type: "API",
    },
  ];

  const displayProjects = projects || mockProjects;
  const currentProject = displayProjects[currentIndex];

  // Auto-cycle through projects every 4 seconds
  useEffect(() => {
    if (displayProjects.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayProjects.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [displayProjects.length, isPaused]);

  const handleClick = () => {
    setCurrentIndex((prev) => (prev + 1) % displayProjects.length);
  };

  const getProjectTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
      Web: "#10b981", // emerald
      API: "#3b82f6", // blue
      AI: "#8b5cf6", // violet
      Mobile: "#f59e0b", // amber
      Desktop: "#ef4444", // red
      Game: "#ec4899", // pink
    };
    return colors[type || "Web"] || "#6b7280";
  };

  const getProjectTypeIcon = (type?: string) => {
    const icons: Record<string, string> = {
      Web: "🌐",
      API: "🔌",
      AI: "🤖",
      Mobile: "📱",
      Desktop: "💻",
      Game: "🎮",
    };
    return icons[type || "Web"] || "📁";
  };

  const folderVariants = {
    animate: {
      rotateY: [0, 15, -15, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 2.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut" as const,
      },
    },
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-xs">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card
        className="w-full max-w-xs border-rose-200 bg-rose-50/50 hover:bg-rose-50/80 dark:border-rose-800 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 transition-all duration-300 group cursor-pointer"
        onClick={handleClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center flex-shrink-0 relative">
              <motion.div variants={folderVariants} animate="animate">
                <FolderOpen className="h-3 w-3 text-rose-600 dark:text-rose-400" />
              </motion.div>
              <div className="absolute -top-0.5 -right-0.5">
                <div
                  className="h-2 w-2 rounded-full shadow-sm"
                  style={{
                    backgroundColor: getProjectTypeColor(currentProject.type),
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-xs truncate leading-tight text-foreground">
                      {currentProject.name}
                    </p>
                    <ChevronRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-2 w-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground leading-tight">
                      {currentProject.hours}h {currentProject.minutes}m
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-0 font-medium flex-shrink-0"
            >
              {getProjectTypeIcon(currentProject.type)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
