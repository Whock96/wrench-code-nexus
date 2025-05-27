
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleReportData } from "@/hooks/useReportData";
import { ReportExporter } from "@/services/report-exporter";
import { DateRange } from "react-day-picker";

interface VehicleReportTableProps {
  data: VehicleReportData[];
  isLoading: boolean;
  dateRange: DateRange | undefined;
  title?: string;
  description?: string;
}

const VehicleReportTable: React.FC<VehicleReportTableProps> = ({
  data,
  isLoading,
  dateRange,
  title = "Relatório de Veículos",
  description = "Análise de veículos por faturamento e número de ordens de serviço"
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const handleExportPDF = () => {
    if (data.length > 0 && dateRange?.from) {
      ReportExporter.exportVehicleReportToPDF(
        data,
        { from: dateRange.from, to: dateRange.to || new Date() }
      );
    }
  };

  const handleExportExcel = () => {
    if (data.length > 0) {
      ReportExporter.exportToExcel(
        data,
        "Veículos",
        "relatorio-veiculos"
      );
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
                  <TableHead>Placa</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total de OS</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                  <TableHead>Último Serviço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.licensePlate}</TableCell>
                    <TableCell>{`${item.make} ${item.model} (${item.year})`}</TableCell>
                    <TableCell>{item.customerName}</TableCell>
                    <TableCell className="text-right">{item.totalOrders}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
                    <TableCell>{item.lastServiceDate}</TableCell>
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

export default VehicleReportTable;
