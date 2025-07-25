/**
 * Type definitions for WakaTime API responses
 */

// Raw API Response Types
export interface WakatimeStatsResponse {
  data: {
    daily_average: number;
    total_seconds: number;
    languages: Array<{
      name: string;
      percent: number;
      total_seconds: number;
    }>;
    range?: string;
  };
}

export interface WakatimeSummariesResponse {
  data: Array<{
    projects?: Array<{
      name: string;
      total_seconds: number;
    }>;
    editors?: Array<{
      name: string;
      total_seconds: number;
    }>;
    operating_systems?: Array<{
      name: string;
      total_seconds: number;
    }>;
  }>;
}

export interface WakatimeTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Error Types
export interface WakatimeApiError {
  error: string;
  error_description?: string;
}

// Utility Types
export type WakatimeApiResponse<T> = T | WakatimeApiError;

export function isWakatimeError(response: any): response is WakatimeApiError {
  return response && typeof response.error === 'string';
}