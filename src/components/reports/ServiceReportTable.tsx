
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface ServiceReportData {
  type: string;
  description: string;
  totalQuantity: number;
  totalRevenue: number;
  occurrences: number;
}

interface ServiceReportTableProps {
  data: ServiceReportData[];
  isLoading: boolean;
  dateRange: DateRange | undefined;
  title?: string;
  description?: string;
}

const ServiceReportTable: React.FC<ServiceReportTableProps> = ({
  data,
  isLoading,
  dateRange,
  title = "Relatório de Serviços e Peças",
  description = "Análise de serviços e peças por faturamento e frequência"
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Ocorrências</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead className="text-right">Valor Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === "service" ? "default" : "secondary"}>
                        {item.type === "service" ? "Serviço" : "Peça"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.totalQuantity}</TableCell>
                    <TableCell className="text-right">{item.occurrences}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.totalRevenue / item.occurrences)}
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

export default ServiceReportTable;
