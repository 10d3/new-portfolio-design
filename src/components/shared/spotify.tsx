"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, ExternalLink } from "lucide-react";
import type { SpotifyNowPlayingResponse } from "@/lib/types/spotify";
import { calculateProgress } from "@/lib/time";

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

  if (loading) {
    return (
      <Card className="w-full max-w-xs border-0 shadow-sm bg-gradient-to-r from-slate-50 to-gray-50">
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
      <Card className="w-full hidden max-w-xs border-0 shadow-sm bg-gradient-to-r from-red-50 to-rose-50">
        <CardContent className="p-2">
          <div className="flex items-center gap-2 text-red-600">
            <Music className="h-3 w-3" />
            <p className="text-xs font-medium">Unable to load</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.is_playing || !data.item) {
    return (
      <Card className="mt-4 hidden w-full max-w-xs border-0 shadow-sm bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-2">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            <p className="text-xs font-medium">Not playing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { item, device, shuffle_state, repeat_state } = data;
  const artistNames = item.artists.map((artist) => artist.name).join(", ");
  const albumImage = item.album.images[0]?.url;
  const progressPercentage = calculateProgress(
    currentProgress,
    item.duration_ms
  );

  return (
    <Card className=" mt-2 w-full max-w-xs border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          {albumImage ? (
            <div className="relative flex-shrink-0">
              <Image
                src={albumImage || "/placeholder.svg"}
                alt={`${item.album.name} cover`}
                width={32}
                height={32}
                className="h-8 w-8 rounded object-cover"
              />
              <div className="absolute -top-0.5 -right-0.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Music className="h-3 w-3 text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <a
              href={item.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="block group-hover:text-green-700 transition-colors duration-200"
            >
              <div className="flex items-center gap-1">
                <p className="font-medium text-xs truncate leading-tight">
                  {item.name}
                </p>
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-600 truncate leading-tight">
                {artistNames}
              </p>
            </a>
          </div>

          <Badge
            variant="secondary"
            className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 border-0 font-medium flex-shrink-0"
          >
            ♪
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
