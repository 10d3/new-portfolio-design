import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables (without exposing actual values)
    const envCheck = {
      WAKATIME_ACCESS_TOKEN: !!process.env.WAKATIME_ACCESS_TOKEN,
      WAKATIME_REFRESH_TOKEN: !!process.env.WAKATIME_REFRESH_TOKEN,
      WAKATIME_EXPIRES_AT: !!process.env.WAKATIME_EXPIRES_AT,
      ACCESS_TOKEN: !!process.env.ACCESS_TOKEN,
      WAKATIME_CLIENT_ID: !!process.env.WAKATIME_CLIENT_ID,
      WAKATIME_CLIENT_SECRET: !!process.env.WAKATIME_CLIENT_SECRET,
      WAKATIME_REDIRECT_URI: !!process.env.WAKATIME_REDIRECT_URI,
    };

    // Check if expires_at is valid
    let expiryInfo = null;
    const expiresAt = process.env.WAKATIME_EXPIRES_AT;
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      const isExpired = expiryDate.getTime() - now.getTime() < 5 * 60 * 1000;
      
      expiryInfo = {
        expiresAt: expiresAt,
        expiryDate: expiryDate.toISOString(),
        currentTime: now.toISOString(),
        isExpired: isExpired,
        timeUntilExpiry: expiryDate.getTime() - now.getTime(),
      };
    }

    return NextResponse.json({
      environment: envCheck,
      expiry: expiryInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}