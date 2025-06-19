"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface TotalCodingTimeProps {
  totalHours?: number;
  isLoading?: boolean;
}

export function TotalCodingTime({
  totalHours,
  isLoading = false,
}: TotalCodingTimeProps) {
  const [displayHours, setDisplayHours] = useState(0);

  // Mock data
  const mockTotalHours = 1247;

  useEffect(() => {
    if (!isLoading && (totalHours || mockTotalHours)) {
      const target = totalHours || mockTotalHours;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayHours(target);
          clearInterval(timer);
        } else {
          setDisplayHours(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [totalHours, isLoading]);

  const iconVariants = {
    animate: {
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
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
    className="m-0 p-0 max-w-xs h-fit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-xs border-blue-200 bg-blue-50/50 hover:bg-blue-50/80 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 transition-all duration-300 group">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 relative">
              <motion.div variants={iconVariants} animate="animate">
                <Code className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </motion.div>
              <div className="absolute -top-0.5 -right-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-sm leading-tight text-foreground">
                  {displayHours.toLocaleString()}h
                </p>
                <TrendingUp className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                Total coding time
              </p>
            </div>

            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0 font-medium flex-shrink-0"
            >
              ⏱️
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
