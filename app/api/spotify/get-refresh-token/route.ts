import { NextRequest, NextResponse } from "next/server";

// Client Credentials Flow (won't work for user data)
async function getAccessToken() {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authorization Code to Refresh Token (what you actually need)
async function getRefreshTokenFromCode(authCode: string) {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
  const REDIRECT_URI =
    process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/callback";

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, details: ${errorText}`
    );
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // If there's an error from Spotify
  if (error) {
    return NextResponse.json(
      {
        error: `Spotify authorization failed: ${error}`,
        step: "Try the authorization link again",
      },
      { status: 400 }
    );
  }

  // If no code, show authorization link
  if (!code) {
    const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const REDIRECT_URI =
      process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/callback";

    const authUrl =
      `https://accounts.spotify.com/authorize?` +
      new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID!,
        scope: "user-read-currently-playing user-read-playback-state",
        redirect_uri: REDIRECT_URI,
        show_dialog: "true",
      });

    return NextResponse.json({
      message: "Click the link below to authorize and get your refresh token",
      authorization_url: authUrl,
      instructions: [
        "1. Click the authorization URL",
        "2. Log in to Spotify and authorize the app",
        "3. You will be redirected back here with your tokens",
        "4. Copy the refresh_token to your .env file",
      ],
    });
  }

  // If we have a code, exchange it for tokens
  try {
    console.log("🔄 Exchanging authorization code for tokens...");
    const tokenData = await getRefreshTokenFromCode(code);

    console.log("✅ Success! Tokens received");
    console.log(
      "Access Token:",
      tokenData.access_token.substring(0, 20) + "..."
    );
    console.log(
      "Refresh Token:",
      tokenData.refresh_token.substring(0, 20) + "..."
    );

    return NextResponse.json({
      success: true,
      message: "🎉 SUCCESS! Copy the refresh_token below to your .env file",
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
      },
      next_steps: [
        "1. Copy the refresh_token value",
        "2. Update your .env file: SPOTIFY_REFRESH_TOKEN=your_refresh_token_here",
        "3. Restart your dev server",
        "4. Test /api/spotify/now-playing",
      ],
    });
  } catch (error) {
    console.error("❌ Token exchange failed:", error);
    return NextResponse.json(
      {
        error: "Failed to exchange code for tokens",
        details: error instanceof Error ? error.message : "Unknown error",
        try_again: "Visit this endpoint again to get a new authorization link",
      },
      { status: 500 }
    );
  }
}

// Test endpoint to demonstrate the difference
export async function POST() {
  try {
    console.log("🧪 Testing Client Credentials Flow...");
    const tokenData = await getAccessToken();

    console.log(
      "✅ Client Credentials Token:",
      tokenData.access_token.substring(0, 20) + "..."
    );
    console.log(
      "⚠️  This token CANNOT access user data like currently playing tracks"
    );

    return NextResponse.json({
      message: "⚠️ Client Credentials flow works, but CANNOT access user data",
      token_preview: tokenData.access_token.substring(0, 20) + "...",
      expires_in: tokenData.expires_in,
      warning: "This token cannot access /me/player/currently-playing endpoint",
      solution: "Use GET method on this endpoint to get a proper refresh token",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Client credentials test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
