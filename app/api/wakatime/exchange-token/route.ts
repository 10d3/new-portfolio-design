import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const clientId = process.env.WAKATIME_CLIENT_ID;
    const clientSecret = process.env.WAKATIME_CLIENT_SECRET;
    const redirectUri = process.env.WAKATIME_REDIRECT_URI;
    const tokenEndpoint = 'https://wakatime.com/oauth/token';

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Missing WAKATIME_CLIENT_ID, WAKATIME_CLIENT_SECRET, or WAKATIME_REDIRECT_URI in environment' }, { status: 500 });
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Token exchange failed', details: errorText }, { status: response.status });
    }

    const tokenData = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Tokens received',
      tokens: tokenData,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to exchange code', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 