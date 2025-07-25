import { getWakatimeStatsAndProjects } from "@/lib/wakastat";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Fetch fresh WakaTime data
    const wakatimeData = await getWakatimeStatsAndProjects();
    
    // Revalidate the home page to clear its cache
    revalidatePath("/");
    
    return NextResponse.json({
      success: true,
      message: "WakaTime stats refreshed successfully",
      data: wakatimeData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error refreshing WakaTime stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh WakaTime stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST({} as NextRequest);
}