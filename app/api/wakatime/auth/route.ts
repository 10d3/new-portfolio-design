import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.WAKATIME_CLIENT_ID;
  const redirectUri = process.env.WAKATIME_REDIRECT_URI;
  const scopes = 'read_stats read_summaries';

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Missing WAKATIME_CLIENT_ID or WAKATIME_REDIRECT_URI in environment' }, { status: 500 });
  }

  const authUrl = `https://wakatime.com/oauth/authorize?` + new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    state: Math.random().toString(36).substring(2, 15),
  });

  return NextResponse.redirect(authUrl);
} 