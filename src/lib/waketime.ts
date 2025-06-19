export function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    Python: "#3776ab",
    Java: "#ed8b00",
    "C++": "#00599c",
    Go: "#00add8",
    Rust: "#000000",
    PHP: "#777bb4",
    Ruby: "#cc342d",
    Swift: "#fa7343",
    Kotlin: "#7f52ff",
    "C#": "#239120",
    HTML: "#e34f26",
    CSS: "#1572b6",
    Vue: "#4fc08d",
    React: "#61dafb",
  };

  return colors[language] || "#6b7280";
}
