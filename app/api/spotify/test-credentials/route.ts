import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  console.log("🔍 Testing Spotify credentials...");
  console.log(
    "Client ID:",
    CLIENT_ID ? `${CLIENT_ID.substring(0, 8)}...` : "MISSING"
  );
  console.log(
    "Client Secret:",
    CLIENT_SECRET ? `${CLIENT_SECRET.substring(0, 8)}...` : "MISSING"
  );

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json(
      {
        error: "Missing credentials",
        client_id_present: !!CLIENT_ID,
        client_secret_present: !!CLIENT_SECRET,
      },
      { status: 400 }
    );
  }

  try {
    // Test client credentials flow
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      "base64"
    );
    console.log("Basic auth header:", basic.substring(0, 20) + "...");

    const response = await fetch("https://accounts.spotify.com/api/token", {
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
      const errorText = await response.text();
      console.error("Error response:", errorText);

      return NextResponse.json(
        {
          error: "Spotify API error",
          status: response.status,
          details: errorText,
          troubleshooting: [
            "Check if your Client ID and Client Secret are correct",
            "Verify they are from the same Spotify app",
            "Make sure there are no extra spaces or characters",
            "Check if your Spotify app is active (not in development mode restriction)",
          ],
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ Credentials valid! Token received");

    return NextResponse.json({
      success: true,
      message: "Credentials are valid!",
      token_type: data.token_type,
      expires_in: data.expires_in,
      access_token_preview: data.access_token.substring(0, 20) + "...",
    });
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
