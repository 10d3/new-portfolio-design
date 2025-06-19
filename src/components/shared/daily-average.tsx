"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Target } from "lucide-react";
import { motion } from "framer-motion";

interface DailyAverageProps {
  averageHours?: number;
  averageMinutes?: number;
  isLoading?: boolean;
}

export function DailyAverage({
  averageHours,
  averageMinutes,
  isLoading = false,
}: DailyAverageProps) {
  // Mock data
  const mockHours = 4;
  const mockMinutes = 32;

  const displayHours = averageHours || mockHours;
  const displayMinutes = averageMinutes || mockMinutes;

  const clockVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear" as const,
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
              <Skeleton className="h-2.5 w-20" />
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
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="w-full mt-8 max-w-xs border-orange-200 bg-orange-50/50 hover:bg-orange-50/80 dark:border-orange-800 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 transition-all duration-300 group">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0 relative">
              <motion.div variants={clockVariants} animate="animate">
                <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
              </motion.div>
              <div className="absolute -top-0.5 -right-0.5">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-sm" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-medium text-xs leading-tight text-foreground">
                  {displayHours}h {displayMinutes}m
                </p>
                <Target className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-xs text-muted-foreground leading-tight">
                Daily average
              </p>
            </div>

            <Badge
              variant="secondary"
              className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-0 font-medium flex-shrink-0"
            >
              📊
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
