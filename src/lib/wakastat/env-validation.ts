/**
 * Environment variable validation for WakaTime integration
 */

export interface WakatimeEnvConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  combinedToken?: string;
}

export function validateWakatimeEnv(): WakatimeEnvConfig {
  const config: Partial<WakatimeEnvConfig> = {
    clientId: process.env.WAKATIME_CLIENT_ID,
    clientSecret: process.env.WAKATIME_CLIENT_SECRET,
    redirectUri: process.env.WAKATIME_REDIRECT_URI,
    accessToken: process.env.WAKATIME_ACCESS_TOKEN,
    refreshToken: process.env.WAKATIME_REFRESH_TOKEN,
    expiresAt: process.env.WAKATIME_EXPIRES_AT,
    combinedToken: process.env.ACCESS_TOKEN,
  };

  // Check required OAuth credentials
  const missingRequired = [];
  if (!config.clientId) missingRequired.push("WAKATIME_CLIENT_ID");
  if (!config.clientSecret) missingRequired.push("WAKATIME_CLIENT_SECRET");
  if (!config.redirectUri) missingRequired.push("WAKATIME_REDIRECT_URI");

  if (missingRequired.length > 0) {
    throw new Error(`Missing required environment variables: ${missingRequired.join(", ")}`);
  }

  // Check if we have either individual tokens or combined token
  const hasIndividualTokens = config.accessToken && config.refreshToken;
  const hasCombinedToken = config.combinedToken;

  if (!hasIndividualTokens && !hasCombinedToken) {
    throw new Error(
      "Missing WakaTime tokens. Please provide either:\n" +
      "1. WAKATIME_ACCESS_TOKEN and WAKATIME_REFRESH_TOKEN, or\n" +
      "2. ACCESS_TOKEN (combined token string)"
    );
  }

  return config as WakatimeEnvConfig;
}

export function getEnvStatus() {
  try {
    const config = validateWakatimeEnv();
    return {
      isValid: true,
      config,
      hasIndividualTokens: !!(config.accessToken && config.refreshToken),
      hasCombinedToken: !!config.combinedToken,
      hasExpiryInfo: !!config.expiresAt,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}