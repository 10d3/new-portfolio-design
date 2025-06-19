"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface DevToolsProps {
  editor?: string;
  os?: string;
  isLoading?: boolean;
}

export function DevTools({ editor, os, isLoading = false }: DevToolsProps) {
  // Mock data
  const mockEditor = "VS Code";
  const mockOS = "macOS";

  const displayEditor = editor || mockEditor;
  const displayOS = os || mockOS;

  const getEditorIcon = (editorName: string) => {
    const icons: Record<string, string> = {
      "VS Code": "⚡",
      WebStorm: "🧠",
      Vim: "🔥",
      "Sublime Text": "💎",
      Atom: "⚛️",
    };
    return icons[editorName] || "💻";
  };

  const zapVariants = {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1.5,
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
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-12" />
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
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="w-full max-w-xs border-teal-200 bg-teal-50/50 hover:bg-teal-50/80 dark:border-teal-800 dark:bg-teal-950/30 dark:hover:bg-teal-950/50 transition-all duration-300 group">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center flex-shrink-0 relative">
              <motion.div variants={zapVariants} animate="animate">
                <Zap className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              </motion.div>
              <div className="absolute -top-0.5 -right-0.5">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse shadow-sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-medium text-xs truncate leading-tight text-foreground">
                  {displayEditor}
                </p>
                <Monitor className="h-2.5 w-2.5 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-xs text-muted-foreground truncate leading-tight">
                {displayOS}
              </p>
            </div>

            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border-0 font-medium flex-shrink-0"
            >
              {getEditorIcon(displayEditor)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
