import { Calendar, Info } from "lucide-react";

interface DataRangeIndicatorProps {
  dataRange?: string;
  className?: string;
}

export function DataRangeIndicator({ dataRange = "last_7_days", className = "" }: DataRangeIndicatorProps) {
  const getRangeText = (range: string) => {
    switch (range) {
      case "last_7_days":
        return "Last 7 days";
      case "last_30_days":
        return "Last 30 days";
      case "last_6_months":
        return "Last 6 months";
      case "last_year":
        return "Last year";
      default:
        return "Last 7 days";
    }
  };

  const isFreeAccount = dataRange === "last_7_days";

  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <Calendar className="h-3 w-3" />
      <span>
        Data from {getRangeText(dataRange)}
        {isFreeAccount && (
          <span className="ml-1 inline-flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span className="text-orange-600 dark:text-orange-400">(Free account)</span>
          </span>
        )}
      </span>
    </div>
  );
}