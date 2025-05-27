
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, Users, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { useReportData } from "@/hooks/useReportData";
import RevenueChart from "@/components/reports/RevenueChart";
import StatusDistributionChart from "@/components/reports/StatusDistributionChart";
import ServiceTrendChart from "@/components/reports/ServiceTrendChart";
import CustomerReportTable from "@/components/reports/CustomerReportTable";
import VehicleReportTable from "@/components/reports/VehicleReportTable";

const ReportsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const {
    isLoading,
    stats,
    revenueByPeriod,
    statusDistribution,
    serviceTrend,
    customerReport,
    vehicleReport,
    isLoadingCustomerReport,
    isLoadingVehicleReport
  } = useReportData(dateRange);

  // Presets para filtros rápidos
  const handleFilterPreset = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFilterPreset(7)}
              >
                7 dias
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFilterPreset(30)}
              >
                30 dias
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFilterPreset(90)}
              >
                90 dias
              </Button>
            </div>
            <DateRangePicker date={dateRange} onUpdate={(range) => setDateRange(range.range)} />
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Cards de Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? "..."
                      : stats
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.totalRevenue)
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    OS concluídas no período selecionado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">OS Criadas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : stats ? stats.totalServiceOrders : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ordens de serviço criadas no período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">OS Concluídas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : stats ? stats.totalCompletedOrders : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ordens de serviço concluídas no período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : stats ? stats.totalClients : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de clientes cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? "..." : stats ? stats.totalVehicles : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total de veículos cadastrados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Relatórios */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
              {/* Gráfico de Faturamento por Período */}
              <RevenueChart 
                data={revenueByPeriod} 
                isLoading={isLoading}
                dateRange={dateRange}
              />

              {/* Gráfico de Distribuição de Status */}
              <StatusDistributionChart 
                data={statusDistribution} 
                isLoading={isLoading}
                dateRange={dateRange}
              />
            </div>

            {/* Gráfico de Tendência de OS */}
            <div className="grid gap-4 grid-cols-1">
              <ServiceTrendChart 
                data={serviceTrend} 
                isLoading={isLoading}
                dateRange={dateRange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="space-y-4">
            <CustomerReportTable 
              data={customerReport}
              isLoading={isLoadingCustomerReport}
              dateRange={dateRange}
            />
          </TabsContent>
          
          <TabsContent value="vehicles" className="space-y-4">
            <VehicleReportTable 
              data={vehicleReport}
              isLoading={isLoadingVehicleReport}
              dateRange={dateRange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsDashboard;
