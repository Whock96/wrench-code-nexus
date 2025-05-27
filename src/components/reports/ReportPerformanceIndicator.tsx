
import React from "react";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Clock } from "lucide-react";

interface ReportPerformanceIndicatorProps {
  isLoading: boolean;
  cacheStatus: "hit" | "miss" | "stale";
  lastUpdated?: Date;
  dataCount?: number;
}

const ReportPerformanceIndicator: React.FC<ReportPerformanceIndicatorProps> = ({
  isLoading,
  cacheStatus,
  lastUpdated,
  dataCount
}) => {
  const getCacheStatusBadge = () => {
    switch (cacheStatus) {
      case "hit":
        return <Badge variant="default" className="bg-green-500"><Database className="h-3 w-3 mr-1" />Cache</Badge>;
      case "miss":
        return <Badge variant="destructive"><RefreshCw className="h-3 w-3 mr-1" />Novo</Badge>;
      case "stale":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Antigo</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {isLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
      {getCacheStatusBadge()}
      {dataCount && <span>{dataCount} registros</span>}
      {lastUpdated && (
        <span>
          Atualizado: {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ReportPerformanceIndicator;
