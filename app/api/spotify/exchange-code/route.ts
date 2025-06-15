import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
    const REDIRECT_URI = "https://amherley.dev/callback";

    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );

    console.log("🔄 Exchanging code for tokens...");
    console.log("Code:", code.substring(0, 20) + "...");

    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Token exchange failed:", response.status, errorText);
      return NextResponse.json(
        {
          error: `Token exchange failed: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    console.log("✅ Success! Tokens received");

    return NextResponse.json({
      success: true,
      message: "🎉 SUCCESS! Copy the refresh_token to your .env file",
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
      },
      instructions: [
        "1. Copy the refresh_token below",
        "2. Update your .env file: SPOTIFY_REFRESH_TOKEN=your_refresh_token",
        "3. Restart your dev server",
        "4. Test /api/spotify/now-playing",
      ],
      refresh_token_to_copy: tokenData.refresh_token,
    });
  } catch (error) {
    console.error("💥 Error:", error);
    return NextResponse.json(
      {
        error: "Failed to exchange code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET method to show usage
export async function GET() {
  return NextResponse.json({
    message: "POST your authorization code here",
    usage: 'POST /api/spotify/exchange-code with { "code": "your_code_here" }',
    your_code:
      "AQBAPZlISDZj4f4EV9qaEymZtmrYtr3_DeSc8CRtfMxEhwBBHAccsNMMmMB3D0i8p189za8cxGm_E2r-BgxNZ3J_EmIX5_W_Drv0zt1mEKRUemjH1J82pAXlRXk3wg0bC8oDSM_iTxrbTs-e0pBJC0Pd4KSxxMaaxjC-idb1HXd02ftgEC-h393Y7spyv-2xtQsi9khYARKBEXhcXSfMDEIPG4PshDdRGMPEKkgwTVms8ixJxaCZ5A",
  });
}
