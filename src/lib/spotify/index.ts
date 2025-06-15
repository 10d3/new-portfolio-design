// You'll need these stored somewhere (localStorage, database, etc.)
// These would come from the initial authorization code flow
let USER_ACCESS_TOKEN: string | null = null;
let USER_REFRESH_TOKEN: string | null = null;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

interface SpotifyTrack {
  is_playing: boolean;
  item?: {
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    external_urls: {
      spotify: string;
    };
  };
}

// Function to refresh user access token
async function refreshUserAccessToken() {
  if (!USER_REFRESH_TOKEN) {
    throw new Error("No refresh token available. User needs to re-authorize.");
  }

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: USER_REFRESH_TOKEN,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("✅ Token refresh successful!");
  USER_ACCESS_TOKEN = data.access_token;

  // Refresh token might be updated
  if (data.refresh_token) {
    USER_REFRESH_TOKEN = data.refresh_token;
  }

  return data;
}

// Function to get user access token (with automatic refresh)
async function getUserAccessToken() {
  if (!USER_ACCESS_TOKEN) {
    if (!USER_REFRESH_TOKEN) {
      throw new Error(
        "No access token or refresh token. User needs to authorize first."
      );
    }
    await refreshUserAccessToken();
  }
  return USER_ACCESS_TOKEN;
}

export async function getCurrentPlayingTrack(): Promise<SpotifyTrack | null> {
  try {
    // Get user access token (not client credentials)
    const accessToken = await getUserAccessToken();

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-cache",
    });

    if (response.status === 204) {
      // No content - nothing is playing
      return { is_playing: false };
    }

    if (response.status === 401) {
      // Token might be expired, try to refresh
      console.log("Token expired, attempting refresh...");
      try {
        await refreshUserAccessToken();
        const newAccessToken = await getUserAccessToken();

        // Retry the request with new token
        const retryResponse = await fetch(NOW_PLAYING_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
          cache: "no-cache",
        });

        if (retryResponse.status === 204) {
          return { is_playing: false };
        }

        if (!retryResponse.ok) {
          console.error("Retry failed:", retryResponse.status);
          return null;
        }

        const retryData = await retryResponse.json();
        return retryData as SpotifyTrack;
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return null;
      }
    }

    if (!response.ok) {
      console.error("API Error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data as SpotifyTrack;
  } catch (error) {
    console.error("Error fetching currently playing track:", error);
    return null;
  }
}

// Initial authorization flow (call this first to get tokens)
export function getAuthorizationUrl() {
  const scopes = "user-read-currently-playing user-read-playback-state";
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/callback"; // Must match what's registered in Spotify app

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID!,
    scope: scopes,
    redirect_uri: redirectUri,
    show_dialog: "true",
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

// Exchange authorization code for tokens (call this after user authorizes)
export async function exchangeCodeForTokens(
  authorizationCode: string,
  redirectUri: string
) {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: authorizationCode,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Authorization failed: ${response.status}`);
  }

  const data = await response.json();

  // Store these tokens
  USER_ACCESS_TOKEN = data.access_token;
  USER_REFRESH_TOKEN = data.refresh_token;

  return data;
}

// Helper function to set tokens (if you store them elsewhere)
export function setUserTokens(accessToken: string, refreshToken: string) {
  USER_ACCESS_TOKEN = accessToken;
  USER_REFRESH_TOKEN = refreshToken;
}

// Initialize tokens from environment (for development/testing)
export function initTokensFromEnv() {
  const envAccessToken = process.env.SPOTIFY_ACCESS_TOKEN;
  const envRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (envRefreshToken && envRefreshToken !== "your_refresh_token_here") {
    USER_REFRESH_TOKEN = envRefreshToken;
    console.log("✅ Refresh token loaded from environment");
  }

  if (envAccessToken && envAccessToken !== "your_access_token_here") {
    USER_ACCESS_TOKEN = envAccessToken;
    console.log("✅ Access token loaded from environment");
  }
}
