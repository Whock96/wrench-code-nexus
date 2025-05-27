
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportExporter } from "@/services/report-exporter";
import { DateRange } from "react-day-picker";

interface StatusDistributionChartProps {
  data: {
    status: string;
    count: number;
    color: string;
  }[];
  isLoading: boolean;
  dateRange: DateRange | undefined;
  title?: string;
  description?: string;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  isLoading,
  dateRange,
  title = "Distribuição de Status",
  description = "Distribuição atual das ordens de serviço por status"
}) => {
  // Tradução dos status para português
  const translateStatus = (status: string): string => {
    const translations: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovada",
      in_progress: "Em Andamento",
      waiting_parts: "Aguardando Peças",
      completed: "Concluída",
      canceled: "Cancelada"
    };
    return translations[status] || status;
  };

  const handleExportPDF = () => {
    if (data.length > 0 && dateRange?.from) {
      ReportExporter.exportStatusDistributionToPDF(
        data,
        { from: dateRange.from, to: dateRange.to || new Date() }
      );
    }
  };

  const handleExportExcel = () => {
    if (data.length > 0) {
      ReportExporter.exportToExcel(
        data,
        "Status",
        "relatorio-status"
      );
    }
  };

  return (
    <Card className="col-span-2">
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
      <CardContent>
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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="status"
                label={({ name }) => translateStatus(name as string)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [value, translateStatus(name as string)]}
              />
              <Legend formatter={(value) => translateStatus(value)} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusDistributionChart;
