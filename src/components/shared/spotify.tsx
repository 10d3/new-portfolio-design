"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, ExternalLink } from "lucide-react";
import { motion, Variants } from "framer-motion";
import type { SpotifyNowPlayingResponse } from "@/lib/types/spotify";

export function SpotifyNowPlaying() {
  const [data, setData] = useState<SpotifyNowPlayingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  const fetchCurrentTrack = async () => {
    try {
      const response = await fetch("/api/spotify/now-playing");

      if (!response.ok) {
        throw new Error("Failed to fetch track");
      }

      const spotifyData = await response.json();
      setData(spotifyData);
      setCurrentProgress(spotifyData.progress_ms || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load track");
      console.error("Error fetching track:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update progress in real-time when playing
  useEffect(() => {
    if (!data?.is_playing || !data?.item) return;

    const progressInterval = setInterval(() => {
      setCurrentProgress((prev) => {
        const newProgress = prev + 1000;
        return newProgress >= data.item!.duration_ms
          ? data.item!.duration_ms
          : newProgress;
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [data?.is_playing, data?.item]);

  // Framer Motion animation variants
  const musicIconVariants: Variants = {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const musicIconPulse: Variants = {
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const pulseVariants: Variants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  if (loading) {
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

  if (error) {
    return (
      <Card className="w-full max-w-xs border-destructive/20 bg-destructive/5 hidden">
        <CardContent className="p-2">
          <div className="flex items-center gap-2 text-destructive">
            <motion.div variants={musicIconVariants} animate="animate">
              <Music className="h-3 w-3" />
            </motion.div>
            <p className="text-xs font-medium">Unable to load</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.is_playing || !data.item) {
    return (
      <Card className="w-full max-w-xs hidden">
        <CardContent className="p-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <motion.div variants={musicIconVariants} animate="animate">
              <Music className="h-3 w-3" />
            </motion.div>
            <p className="text-xs font-medium">Not playing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { item } = data;
  const artistNames = item.artists.map((artist) => artist.name).join(", ");
  const albumImage = item.album.images[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full mt-8 max-w-xs border-green-200 bg-green-50/50 hover:bg-green-50/80 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-950/50 transition-all duration-300 group">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            {albumImage ? (
              <div className="relative flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src={albumImage || "/placeholder.svg"}
                    alt={`${item.album.name} cover`}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded object-cover ring-1 ring-border"
                  />
                </motion.div>
                <div className="absolute -top-0.5 -right-0.5">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-green-500 shadow-sm"
                    variants={pulseVariants}
                    animate="animate"
                  />
                </div>
              </div>
            ) : (
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <motion.div variants={musicIconPulse} animate="animate">
                  <Music className="h-3 w-3 text-green-500" />
                </motion.div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <a
                href={item.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
              >
                <div className="flex items-center gap-1">
                  <p className="font-medium text-xs truncate leading-tight text-foreground">
                    {item.name}
                  </p>
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  {artistNames}
                </p>
              </a>
            </div>

            <motion.div
              variants={musicIconPulse}
              animate="animate"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0 font-medium flex-shrink-0"
              >
                ♪
              </Badge>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
