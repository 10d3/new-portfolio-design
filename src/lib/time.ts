export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function calculateProgress(
  progressMs: number,
  durationMs: number
): number {
  return Math.min((progressMs / durationMs) * 100, 100);
}
