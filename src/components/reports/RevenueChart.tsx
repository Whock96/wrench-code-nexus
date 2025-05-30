
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportExporter } from "@/services/report-exporter";
import { DateRange } from "react-day-picker";

interface RevenueChartProps {
  data: {
    period: string;
    revenue: number;
  }[];
  isLoading: boolean;
  dateRange: DateRange | undefined;
  title?: string;
  description?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  isLoading,
  dateRange,
  title = "Faturamento por Período",
  description = "Análise de faturamento baseada em ordens de serviço concluídas"
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

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
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex space-x-2">
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
  );
};

export default RevenueChart;
