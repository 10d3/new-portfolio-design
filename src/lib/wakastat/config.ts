/**
 * WakaTime API Configuration Constants
 */

export const WAKATIME_CONFIG = {
  // API Endpoints
  API_BASE_URL: "https://wakatime.com/api/v1",
  AUTH_URL: "https://wakatime.com/oauth/authorize",
  TOKEN_URL: "https://wakatime.com/oauth/token",
  
  // API Endpoints
  ENDPOINTS: {
    STATS: "/users/current/stats",
    PROJECTS: "/users/current/projects", 
    SUMMARIES: "/users/current/summaries",
  },

  // OAuth Scopes
  SCOPES: "read_stats read_summaries",

  // Rate Limiting & Caching
  CACHE_DURATION: 3600, // 1 hour in seconds
  TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Data Ranges (for free vs premium accounts)
  DATA_RANGES: {
    FREE_ACCOUNT: "last_7_days",
    PREMIUM_RANGES: ["last_7_days", "last_30_days", "last_6_months", "last_year"],
  },

  // Project Type Classification
  PROJECT_TYPES: {
    API: ["api", "backend", "server"],
    AI: ["ai", "ml", "bot", "machine-learning"],
    MOBILE: ["mobile", "android", "ios", "react-native"],
    DESKTOP: ["desktop", "electron", "tauri"],
    GAME: ["game", "unity", "unreal"],
    WEB: [], // Default fallback
  },

  // Limits
  MAX_PROJECTS_DISPLAY: 5,
  MAX_LANGUAGES_DISPLAY: 10,
} as const;

export type ProjectType = keyof typeof WAKATIME_CONFIG.PROJECT_TYPES;