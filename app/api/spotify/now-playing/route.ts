import { NextResponse } from "next/server";
import { getCurrentPlayingTrack, initTokensFromEnv } from "@/lib/spotify";

export async function GET() {
  try {
    // Initialize tokens from environment variables
    initTokensFromEnv();
    
    const track = await getCurrentPlayingTrack();

    if (!track) {
      return NextResponse.json({ is_playing: false });
    }

    return NextResponse.json(track);
  } catch (error) {
    console.error("Error in now-playing API:", error);
    return NextResponse.json(
      { error: "Failed to fetch currently playing track" },
      { status: 500 }
    );
  }
}
