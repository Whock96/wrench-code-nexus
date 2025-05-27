
import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportExporter } from "@/services/report-exporter";
import { DateRange } from "react-day-picker";
import ComparisonCard from "./ComparisonCard";
import ReportPerformanceIndicator from "./ReportPerformanceIndicator";

interface OptimizedRevenueChartProps {
  data: {
    period: string;
    revenue: number;
  }[];
  previousPeriodData?: {
    period: string;
    revenue: number;
  }[];
  isLoading: boolean;
  dateRange: DateRange | undefined;
  title?: string;
  description?: string;
  onRefresh?: () => void;
  showComparison?: boolean;
}

const OptimizedRevenueChart: React.FC<OptimizedRevenueChartProps> = ({
  data,
  previousPeriodData,
  isLoading,
  dateRange,
  title = "Faturamento por Período",
  description = "Análise de faturamento baseada em ordens de serviço concluídas",
  onRefresh,
  showComparison = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  // Calcular métricas do período atual
  const currentMetrics = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;
    const maxRevenue = Math.max(...data.map(item => item.revenue), 0);
    
    return { totalRevenue, averageRevenue, maxRevenue };
  }, [data]);

  // Calcular métricas do período anterior para comparação
  const previousMetrics = useMemo(() => {
    if (!previousPeriodData) return null;
    
    const totalRevenue = previousPeriodData.reduce((sum, item) => sum + item.revenue, 0);
    const averageRevenue = previousPeriodData.length > 0 ? totalRevenue / previousPeriodData.length : 0;
    
    return { totalRevenue, averageRevenue };
  }, [previousPeriodData]);

  const handleExportPDF = () => {
    if (data.length > 0 && dateRange?.from) {
      ReportExporter.exportRevenueToPDF(
        data,
        { from: dateRange.from, to: dateRange.to || new Date() }
      );
    }
  };

  const handleExportExcel = () => {
    if (data.length > 0) {
      ReportExporter.exportToExcel(
        data,
        "Faturamento",
        "relatorio-faturamento"
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Cards de comparação se habilitado */}
      {showComparison && previousMetrics && (
        <div className="grid gap-4 md:grid-cols-3">
          <ComparisonCard
            title="Faturamento Total"
            currentValue={currentMetrics.totalRevenue}
            previousValue={previousMetrics.totalRevenue}
            formatValue={formatCurrency}
            isLoading={isLoading}
            description="Comparação com período anterior"
          />
          <ComparisonCard
            title="Faturamento Médio"
            currentValue={currentMetrics.averageRevenue}
            previousValue={previousMetrics.averageRevenue}
            formatValue={formatCurrency}
            isLoading={isLoading}
            description="Média por período"
          />
          <ComparisonCard
            title="Pico de Faturamento"
            currentValue={currentMetrics.maxRevenue}
            previousValue={Math.max(...(previousPeriodData?.map(item => item.revenue) || [0]))}
            formatValue={formatCurrency}
            isLoading={isLoading}
            description="Maior valor em um período"
          />
        </div>
      )}

      {/* Gráfico principal */}
      <Card className="col-span-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
            <ReportPerformanceIndicator
              isLoading={isLoading}
              cacheStatus="hit"
              lastUpdated={new Date()}
              dataCount={data.length}
            />
          </div>
          <div className="flex space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isLoading || data.length === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isLoading || data.length === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <Skeleton className="w-full h-[250px]" />
            </div>
          ) : data.length === 0 ? (
            <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip formatter={(value) => [formatCurrency(value as number), "Faturamento"]} />
                <Bar dataKey="revenue" fill="#8884d8" name="Faturamento" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedRevenueChart;
