"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Code2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLanguageColor } from "@/lib/waketime";

interface Language {
  name: string;
  percent: number;
  hours: number;
}

interface TopLanguagesProps {
  languages?: Language[];
  isLoading?: boolean;
}

export function TopLanguages({
  languages,
  isLoading = false,
}: TopLanguagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mock data - Top 5 languages
  const mockLanguages: Language[] = [
    { name: "TypeScript", percent: 45.2, hours: 156 },
    { name: "JavaScript", percent: 28.7, hours: 99 },
    { name: "Python", percent: 16.1, hours: 55 },
    { name: "React", percent: 6.8, hours: 23 },
    { name: "CSS", percent: 3.2, hours: 11 },
  ];

  const displayLanguages = languages || mockLanguages;
  const currentLanguage = displayLanguages[currentIndex];

  // Auto-cycle through languages every 3 seconds
  useEffect(() => {
    if (displayLanguages.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayLanguages.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [displayLanguages.length, isPaused]);

  const handleClick = () => {
    setCurrentIndex((prev) => (prev + 1) % displayLanguages.length);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-xs">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
    className="h-fit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card
        className="w-full max-w-xs border-purple-200 bg-purple-50/50 hover:bg-purple-50/80 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 transition-all duration-300 group cursor-pointer"
        onClick={handleClick}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 relative">
              <Code2 className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <div className="absolute -top-0.5 -right-0.5">
                <div
                  className="h-2 w-2 rounded-full shadow-sm"
                  style={{
                    backgroundColor: getLanguageColor(currentLanguage.name),
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
                      {currentLanguage.name}
                    </p>
                    <ChevronRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight truncate">
                    {currentLanguage.percent}% this week
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-0 font-medium flex-shrink-0"
            >
              {currentIndex + 1}/{displayLanguages.length}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
