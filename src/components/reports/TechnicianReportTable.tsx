
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface TechnicianReportData {
  name: string;
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
}

interface TechnicianReportTableProps {
  data: TechnicianReportData[];
  isLoading: boolean;
  dateRange: DateRange | undefined;
  title?: string;
  description?: string;
}

const TechnicianReportTable: React.FC<TechnicianReportTableProps> = ({
  data,
  isLoading,
  dateRange,
  title = "Relatório de Técnicos",
  description = "Análise de desempenho por técnico"
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const handleExportPDF = () => {
    if (data.length > 0 && dateRange?.from) {
      toast({
        title: "Exportando relatório",
        description: "O relatório será baixado em breve."
      });
    }
  };

  const handleExportExcel = () => {
    if (data.length > 0) {
      toast({
        title: "Exportando relatório",
        description: "O relatório será baixado em breve."
      });
    }
  };

  return (
    <Card className="col-span-6">
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
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="w-full py-8 text-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Técnico</TableHead>
                  <TableHead className="text-right">Total de OS</TableHead>
                  <TableHead className="text-right">Concluídas</TableHead>
                  <TableHead className="text-right">Pendentes</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead>Taxa de Conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.totalOrders}</TableCell>
                    <TableCell className="text-right">{item.completedOrders}</TableCell>
                    <TableCell className="text-right">{item.pendingOrders}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={item.totalOrders > 0 ? (item.completedOrders / item.totalOrders) * 100 : 0} 
                          className="h-2"
                        />
                        <span className="text-xs text-muted-foreground w-[40px] text-right">
                          {item.totalOrders > 0 
                            ? `${Math.round((item.completedOrders / item.totalOrders) * 100)}%` 
                            : "0%"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicianReportTable;
