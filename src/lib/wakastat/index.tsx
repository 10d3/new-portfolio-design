// Types
export interface WakatimeProject {
  name: string;
  percent: number;
  hours: number;
  minutes: number;
  type?: string;
}

export interface WakatimeLanguage {
  name: string;
  percent: number;
  hours: number;
}

export interface WakatimeDevTools {
  editor: string;
  os: string;
}

export interface WakatimeStats {
  averageHours: number;
  averageMinutes: number;
  languages: WakatimeLanguage[];
  totalHours: number;
  projects?: WakatimeProject[];
  devTools?: WakatimeDevTools;
}

// Parse the ACCESS_TOKEN from env which contains both access token and refresh token
function parseTokensFromEnv() {
  // First try to get individual tokens (cleaner approach)
  let accessToken = process.env.WAKATIME_ACCESS_TOKEN || '';
  let refreshToken = process.env.WAKATIME_REFRESH_TOKEN || '';
  let expiresAt = process.env.WAKATIME_EXPIRES_AT || '';
  
  // If individual tokens are not available, fall back to parsing the combined token
  if (!accessToken || !refreshToken) {
    const tokenString = process.env.ACCESS_TOKEN || '';
    
    // Extract access token (everything before &refresh_token=)
    const accessTokenMatch = tokenString.match(/waka_tok_([^&]+)/);
    accessToken = accessTokenMatch ? `waka_tok_${accessTokenMatch[1]}` : '';
    
    // Extract refresh token
    const refreshTokenMatch = tokenString.match(/refresh_token=([^&]+)/);
    refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : '';
    
    // Extract expires_at
    const expiresAtMatch = tokenString.match(/expires_at=([^&]+)/);
    expiresAt = expiresAtMatch ? decodeURIComponent(expiresAtMatch[1]) : '';
  }
  
  return { accessToken, refreshToken, expiresAt };
}

// Check if the token is expired
function isTokenExpired(expiresAt: string): boolean {
  if (!expiresAt) return true;
  
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  
  // Consider token expired if it expires within the next 5 minutes
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return (expiryDate.getTime() - now.getTime()) < bufferTime;
}

const wakaStat = async () => {
    try {
        const { accessToken, refreshToken, expiresAt } = parseTokensFromEnv();
        
        if (!accessToken || !refreshToken) {
            throw new Error('Missing WakaTime tokens in environment');
        }

        // Check if token is expired and refresh if needed
        if (isTokenExpired(expiresAt)) {
            console.log('Token expired, refreshing...');
            return await getWakatimeStatsAndProjects();
        } else {
            // Token is still valid, fetch both stats and projects
            const [stats, summaries] = await Promise.all([
                fetchWakatimeStats(accessToken),
                fetchWakatimeSummaries(accessToken)
            ]);
            
            const parsedStats = parseWakatimeStats(stats);
            const projects = parseWakatimeProjects(summaries);
            const devTools = parseWakatimeDevTools(summaries);
            
            return {
                ...parsedStats,
                projects,
                devTools
            };
        }
    } catch (error) {
        console.error('Error fetching WakaTime stats:', error);
        throw error;
    }
}

const WAKATIME_AUTH_URL = 'https://wakatime.com/oauth/authorize';
const WAKATIME_TOKEN_URL = 'https://wakatime.com/oauth/token';

export function getWakatimeAuthUrl() {
  const clientId = process.env.WAKATIME_CLIENT_ID;
  const redirectUri = process.env.WAKATIME_REDIRECT_URI;
  const scopes = 'read_stats read_summaries';
  if (!clientId || !redirectUri) return '';
  return (
    WAKATIME_AUTH_URL +
    '?' +
    new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      state: Math.random().toString(36).substring(2, 15),
    })
  );
}

export async function exchangeWakatimeCodeForToken(code: string) {
  const clientId = process.env.WAKATIME_CLIENT_ID;
  const clientSecret = process.env.WAKATIME_CLIENT_SECRET;
  const redirectUri = process.env.WAKATIME_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) throw new Error('Missing WakaTime env vars');
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });
  const response = await fetch(WAKATIME_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function refreshWakatimeAccessToken(refreshToken: string) {
  const clientId = process.env.WAKATIME_CLIENT_ID;
  const clientSecret = process.env.WAKATIME_CLIENT_SECRET;
  const redirectUri = process.env.WAKATIME_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) throw new Error('Missing WakaTime env vars');
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    refresh_token: refreshToken,
  });
  const response = await fetch(WAKATIME_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function fetchWakatimeStats(accessToken: string) {
  const response = await fetch('https://wakatime.com/api/v1/users/current/stats', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function fetchWakatimeProjects(accessToken: string) {
  const response = await fetch('https://wakatime.com/api/v1/users/current/projects', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function fetchWakatimeSummaries(accessToken: string, range: string = 'last_7_days') {
  const response = await fetch(`https://wakatime.com/api/v1/users/current/summaries?range=${range}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export function parseWakatimeStats(stats: any): Omit<WakatimeStats, 'projects'> {
  const dailyAverageSeconds = stats?.data?.daily_average || 0;
  const averageHours = Math.floor(dailyAverageSeconds / 3600);
  const averageMinutes = Math.floor((dailyAverageSeconds % 3600) / 60);

  const languages: WakatimeLanguage[] = (stats?.data?.languages || []).map((lang: any) => ({
    name: lang.name,
    percent: lang.percent,
    hours: Math.round(lang.total_seconds / 3600),
  }));

  const totalHours = Math.round((stats?.data?.total_seconds || 0) / 3600);

  return { averageHours, averageMinutes, languages, totalHours };
}

export function parseWakatimeProjects(summaries: any): WakatimeProject[] {
  if (!summaries?.data || summaries.data.length === 0) {
    return [];
  }

  const projectMap = new Map();

  // Aggregate project data from all days in the summary
  summaries.data.forEach((day: any) => {
    if (day.projects) {
      day.projects.forEach((project: any) => {
        const name = project.name;
        if (projectMap.has(name)) {
          const existing = projectMap.get(name);
          existing.total_seconds += project.total_seconds || 0;
        } else {
          projectMap.set(name, {
            name,
            total_seconds: project.total_seconds || 0,
          });
        }
      });
    }
  });

  // Convert to array and calculate percentages
  const projects = Array.from(projectMap.values());
  const totalSeconds = projects.reduce((sum, project) => sum + project.total_seconds, 0);

  return projects
    .map((project: any) => {
      const hours = Math.floor(project.total_seconds / 3600);
      const minutes = Math.floor((project.total_seconds % 3600) / 60);
      const percent = totalSeconds > 0 ? (project.total_seconds / totalSeconds) * 100 : 0;
      
      // Determine project type based on name patterns
      const name = project.name.toLowerCase();
      let type = 'Web';
      
      if (name.includes('api') || name.includes('backend') || name.includes('server')) {
        type = 'API';
      } else if (name.includes('ai') || name.includes('ml') || name.includes('bot')) {
        type = 'AI';
      } else if (name.includes('mobile') || name.includes('android') || name.includes('ios')) {
        type = 'Mobile';
      } else if (name.includes('desktop') || name.includes('electron')) {
        type = 'Desktop';
      } else if (name.includes('game') || name.includes('unity')) {
        type = 'Game';
      }

      return {
        name: project.name,
        percent: Math.round(percent * 10) / 10,
        hours,
        minutes,
        type,
      } as WakatimeProject;
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5); // Return top 5 projects
}

export function parseWakatimeDevTools(summaries: any): WakatimeDevTools {
  if (!summaries?.data || summaries.data.length === 0) {
    return { editor: 'VS Code', os: 'Unknown' };
  }

  const editorMap = new Map();
  const osMap = new Map();

  // Aggregate editor and OS data from all days in the summary
  summaries.data.forEach((day: any) => {
    // Count editors
    if (day.editors) {
      day.editors.forEach((editor: any) => {
        const name = editor.name;
        const seconds = editor.total_seconds || 0;
        if (editorMap.has(name)) {
          editorMap.set(name, editorMap.get(name) + seconds);
        } else {
          editorMap.set(name, seconds);
        }
      });
    }

    // Count operating systems
    if (day.operating_systems) {
      day.operating_systems.forEach((os: any) => {
        const name = os.name;
        const seconds = os.total_seconds || 0;
        if (osMap.has(name)) {
          osMap.set(name, osMap.get(name) + seconds);
        } else {
          osMap.set(name, seconds);
        }
      });
    }
  });

  // Get the most used editor
  let topEditor = 'VS Code';
  let maxEditorSeconds = 0;
  editorMap.forEach((seconds, name) => {
    if (seconds > maxEditorSeconds) {
      maxEditorSeconds = seconds;
      topEditor = name;
    }
  });

  // Get the most used OS
  let topOS = 'Unknown';
  let maxOSSeconds = 0;
  osMap.forEach((seconds, name) => {
    if (seconds > maxOSSeconds) {
      maxOSSeconds = seconds;
      topOS = name;
    }
  });

  // Clean up OS names for better display
  const cleanOSName = (osName: string): string => {
    const osMap: Record<string, string> = {
      'Mac': 'macOS',
      'macOS': 'macOS', 
      'Windows': 'Windows',
      'Windows 10': 'Windows',
      'Windows 11': 'Windows',
      'Linux': 'Linux',
      'Ubuntu': 'Ubuntu',
      'Unix': 'Unix',
    };
    
    return osMap[osName] || osName;
  };

  return {
    editor: topEditor,
    os: cleanOSName(topOS),
  };
}

function isUnauthorizedError(err: any) {
  // WakaTime returns 401 Unauthorized as a response text
  return (
    err &&
    (err.message?.includes('401') ||
      err.message?.toLowerCase().includes('unauthorized'))
  );
}

export async function fetchWakatimeStatsWithAutoRefresh(accessToken?: string, refreshToken?: string) {
  // If no tokens provided, get them from environment
  let currentAccessToken = accessToken;
  let currentRefreshToken = refreshToken;
  
  if (!currentAccessToken || !currentRefreshToken) {
    const tokens = parseTokensFromEnv();
    currentAccessToken = tokens.accessToken;
    currentRefreshToken = tokens.refreshToken;
    
    if (!currentAccessToken || !currentRefreshToken) {
      throw new Error('Missing WakaTime tokens in environment');
    }
    
    // Check if token is expired and refresh if needed
    if (isTokenExpired(tokens.expiresAt)) {
      console.log('Token expired, refreshing...');
      const tokenData = await refreshWakatimeAccessToken(currentRefreshToken);
      currentAccessToken = tokenData.access_token;
    }
  }
  
  // At this point, both tokens should be defined
  if (!currentAccessToken || !currentRefreshToken) {
    throw new Error('Unable to obtain valid tokens');
  }
  
  try {
    return await fetchWakatimeStats(currentAccessToken);
  } catch (err: any) {
    if (isUnauthorizedError(err)) {
      // Try to refresh the access token
      const tokenData = await refreshWakatimeAccessToken(currentRefreshToken);
      const newAccessToken = tokenData.access_token;
      // Optionally, update your stored access token here!
      return await fetchWakatimeStats(newAccessToken);
    }
    throw err;
  }
}

export async function fetchWakatimeSummariesWithAutoRefresh(accessToken?: string, refreshToken?: string, range: string = 'last_7_days') {
  // If no tokens provided, get them from environment
  let currentAccessToken = accessToken;
  let currentRefreshToken = refreshToken;
  
  if (!currentAccessToken || !currentRefreshToken) {
    const tokens = parseTokensFromEnv();
    currentAccessToken = tokens.accessToken;
    currentRefreshToken = tokens.refreshToken;
    
    if (!currentAccessToken || !currentRefreshToken) {
      throw new Error('Missing WakaTime tokens in environment');
    }
    
    // Check if token is expired and refresh if needed
    if (isTokenExpired(tokens.expiresAt)) {
      console.log('Token expired, refreshing...');
      const tokenData = await refreshWakatimeAccessToken(currentRefreshToken);
      currentAccessToken = tokenData.access_token;
    }
  }
  
  // At this point, both tokens should be defined
  if (!currentAccessToken || !currentRefreshToken) {
    throw new Error('Unable to obtain valid tokens');
  }
  
  try {
    return await fetchWakatimeSummaries(currentAccessToken, range);
  } catch (err: any) {
    if (isUnauthorizedError(err)) {
      // Try to refresh the access token
      const tokenData = await refreshWakatimeAccessToken(currentRefreshToken);
      const newAccessToken = tokenData.access_token;
      // Optionally, update your stored access token here!
      return await fetchWakatimeSummaries(newAccessToken, range);
    }
    throw err;
  }
}

// Simple wrapper function that automatically handles token refresh
export async function getWakatimeStats() {
  return await fetchWakatimeStatsWithAutoRefresh();
}

// Get both stats and projects data
export async function getWakatimeStatsAndProjects(): Promise<WakatimeStats> {
  try {
    const [stats, summaries] = await Promise.all([
      fetchWakatimeStatsWithAutoRefresh(),
      fetchWakatimeSummariesWithAutoRefresh()
    ]);
    
    const parsedStats = parseWakatimeStats(stats);
    const projects = parseWakatimeProjects(summaries);
    const devTools = parseWakatimeDevTools(summaries);
    
    return {
      ...parsedStats,
      projects,
      devTools
    };
  } catch (error) {
    console.error('Error fetching WakaTime data:', error);
    throw error;
  }
}

// Get only projects data
export async function getWakatimeProjects(): Promise<WakatimeProject[]> {
  try {
    const summaries = await fetchWakatimeSummariesWithAutoRefresh();
    return parseWakatimeProjects(summaries);
  } catch (error) {
    console.error('Error fetching WakaTime projects:', error);
    throw error;
  }
}

// Get only dev tools data
export async function getWakatimeDevTools(): Promise<WakatimeDevTools> {
  try {
    const summaries = await fetchWakatimeSummariesWithAutoRefresh();
    return parseWakatimeDevTools(summaries);
  } catch (error) {
    console.error('Error fetching WakaTime dev tools:', error);
    throw error;
  }
}

// Export the main function to get WakaTime stats with automatic token refresh
export { wakaStat };