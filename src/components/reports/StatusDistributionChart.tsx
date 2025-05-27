
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusDistributionChartProps {
  data: {
    status: string;
    count: number;
    color: string;
  }[];
  isLoading: boolean;
  title?: string;
  description?: string;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  isLoading,
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

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
