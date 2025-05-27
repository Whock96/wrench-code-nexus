
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, Users, Car, Wrench, User } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { useCachedReportData } from "@/hooks/useCachedReportData";
import RevenueChart from "@/components/reports/RevenueChart";
import StatusDistributionChart from "@/components/reports/StatusDistributionChart";
import ServiceTrendChart from "@/components/reports/ServiceTrendChart";
import CustomerReportTable from "@/components/reports/CustomerReportTable";
import VehicleReportTable from "@/components/reports/VehicleReportTable";
import ServiceReportTable from "@/components/reports/ServiceReportTable";
import TechnicianReportTable from "@/components/reports/TechnicianReportTable";
import AdvancedFilters from "@/components/reports/AdvancedFilters";
import { 
  ReportType, 
  ReportFilters,
  isOverviewData,
  isCustomerDataArray,
  isVehicleDataArray,
  isServiceDataArray,
  isTechnicianDataArray
} from "@/types/report-types";

const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportType>("overview");
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    }
  });
  
  const { 
    data, 
    isLoading, 
    refreshData, 
    clearReportCache 
  } = useCachedReportData(activeTab, filters);
  
  // Extrair dados do período atual com type guards
  const currentPeriodData = data?.currentPeriod || null;
  
  // Extrair dados do período anterior (para comparação)
  const previousPeriodData = data?.previousPeriod || null;
  
  // Flag para indicar se a comparação está ativa
  const comparisonEnabled = data?.comparisonEnabled || false;
  
  // Calcular variação percentual entre períodos
  const calculateVariation = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (!previous) return { value: 0, isPositive: true };
    const variation = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(variation),
      isPositive: variation >= 0
    };
  };

  // Função para renderizar métricas da visão geral
  const renderOverviewMetrics = () => {
    if (!isOverviewData(currentPeriodData)) return null;

    const previousOverviewData = previousPeriodData && isOverviewData(previousPeriodData) ? previousPeriodData : null;

    return (
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
                : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(currentPeriodData.totalRevenue)}
            </div>
            {comparisonEnabled && previousOverviewData && (
              <div className="flex items-center mt-1">
                <span className={`text-xs ${calculateVariation(currentPeriodData.totalRevenue, previousOverviewData.totalRevenue).isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {calculateVariation(currentPeriodData.totalRevenue, previousOverviewData.totalRevenue).isPositive ? '↑' : '↓'}
                  {calculateVariation(currentPeriodData.totalRevenue, previousOverviewData.totalRevenue).value.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs período anterior
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
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
              {isLoading ? "..." : currentPeriodData.totalOrders}
            </div>
            {comparisonEnabled && previousOverviewData && (
              <div className="flex items-center mt-1">
                <span className={`text-xs ${calculateVariation(currentPeriodData.totalOrders, previousOverviewData.totalOrders).isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {calculateVariation(currentPeriodData.totalOrders, previousOverviewData.totalOrders).isPositive ? '↑' : '↓'}
                  {calculateVariation(currentPeriodData.totalOrders, previousOverviewData.totalOrders).value.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs período anterior
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Ordens de serviço criadas no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(currentPeriodData.averageTicket)}
            </div>
            {comparisonEnabled && previousOverviewData && (
              <div className="flex items-center mt-1">
                <span className={`text-xs ${calculateVariation(currentPeriodData.averageTicket, previousOverviewData.averageTicket).isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {calculateVariation(currentPeriodData.averageTicket, previousOverviewData.averageTicket).isPositive ? '↑' : '↓'}
                  {calculateVariation(currentPeriodData.averageTicket, previousOverviewData.averageTicket).value.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs período anterior
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Valor médio por ordem de serviço
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
              {isLoading 
                ? "..." 
                : currentPeriodData.ordersByStatus?.completed || 0}
            </div>
            {comparisonEnabled && previousOverviewData && (
              <div className="flex items-center mt-1">
                <span className={`text-xs ${calculateVariation(currentPeriodData.ordersByStatus?.completed || 0, previousOverviewData.ordersByStatus?.completed || 0).isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {calculateVariation(currentPeriodData.ordersByStatus?.completed || 0, previousOverviewData.ordersByStatus?.completed || 0).isPositive ? '↑' : '↓'}
                  {calculateVariation(currentPeriodData.ordersByStatus?.completed || 0, previousOverviewData.ordersByStatus?.completed || 0).value.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs período anterior
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Ordens de serviço concluídas no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : currentPeriodData.totalOrders > 0
                ? `${Math.round((currentPeriodData.ordersByStatus?.completed || 0) / currentPeriodData.totalOrders * 100)}%`
                : "N/A"}
            </div>
            {comparisonEnabled && previousOverviewData && previousOverviewData.totalOrders > 0 && (
              <div className="flex items-center mt-1">
                <span className={`text-xs ${
                  calculateVariation(
                    (currentPeriodData.ordersByStatus?.completed || 0) / (currentPeriodData.totalOrders || 1),
                    (previousOverviewData.ordersByStatus?.completed || 0) / (previousOverviewData.totalOrders || 1)
                  ).isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {calculateVariation(
                    (currentPeriodData.ordersByStatus?.completed || 0) / (currentPeriodData.totalOrders || 1),
                    (previousOverviewData.ordersByStatus?.completed || 0) / (previousOverviewData.totalOrders || 1)
                  ).isPositive ? '↑' : '↓'}
                  {calculateVariation(
                    (currentPeriodData.ordersByStatus?.completed || 0) / (currentPeriodData.totalOrders || 1),
                    (previousOverviewData.ordersByStatus?.completed || 0) / (previousOverviewData.totalOrders || 1)
                  ).value.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  vs período anterior
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Percentual de OS concluídas vs criadas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h2>
          <p className="text-muted-foreground">
            Visualize e exporte relatórios detalhados sobre o desempenho do seu negócio.
          </p>
        </div>
        
        <AdvancedFilters 
          filters={filters} 
          onFiltersChange={setFilters} 
          onRefresh={refreshData} 
        />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={(value) => setActiveTab(value as ReportType)}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="customer">Clientes</TabsTrigger>
            <TabsTrigger value="vehicle">Veículos</TabsTrigger>
            <TabsTrigger value="service">Serviços</TabsTrigger>
            <TabsTrigger value="technician">Técnicos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {renderOverviewMetrics()}

            {/* Gráficos de Relatórios */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
              {/* Gráfico de Faturamento por Período */}
              <RevenueChart 
                data={isOverviewData(currentPeriodData) && currentPeriodData.revenueByMonth 
                  ? Object.entries(currentPeriodData.revenueByMonth).map(([period, revenue]) => ({ period, revenue }))
                  : []
                } 
                isLoading={isLoading}
                dateRange={filters.dateRange}
              />

              {/* Gráfico de Distribuição de Status */}
              <StatusDistributionChart 
                data={isOverviewData(currentPeriodData) && currentPeriodData.ordersByStatus 
                  ? Object.entries(currentPeriodData.ordersByStatus).map(([status, count]) => {
                      const statusColors: Record<string, string> = {
                        pending: "#FFA500",     // Orange
                        approved: "#3498db",    // Blue
                        in_progress: "#9b59b6", // Purple
                        waiting_parts: "#f1c40f", // Yellow
                        completed: "#2ecc71",   // Green
                        canceled: "#e74c3c"     // Red
                      };
                      return {
                        status,
                        count,
                        color: statusColors[status] || "#999999"
                      };
                    })
                  : []
                } 
                isLoading={isLoading}
                dateRange={filters.dateRange}
              />
            </div>

            {/* Gráfico de Tendência de OS */}
            <div className="grid gap-4 grid-cols-1">
              <ServiceTrendChart 
                data={isOverviewData(currentPeriodData) && currentPeriodData.revenueByMonth 
                  ? Object.entries(currentPeriodData.revenueByMonth).map(([period, revenue]) => {
                      // Simulação de dados de tendência - em um sistema real, você teria dados reais
                      const created = Math.round(revenue / (Math.random() * 500 + 500));
                      const completed = Math.round(created * (Math.random() * 0.3 + 0.6));
                      return { period, created, completed };
                    })
                  : []
                } 
                isLoading={isLoading}
                dateRange={filters.dateRange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="customer" className="space-y-4">
            <CustomerReportTable 
              data={isCustomerDataArray(currentPeriodData) ? currentPeriodData : []}
              isLoading={isLoading}
              dateRange={filters.dateRange}
            />
          </TabsContent>
          
          <TabsContent value="vehicle" className="space-y-4">
            <VehicleReportTable 
              data={isVehicleDataArray(currentPeriodData) ? currentPeriodData : []}
              isLoading={isLoading}
              dateRange={filters.dateRange}
            />
          </TabsContent>
          
          <TabsContent value="service" className="space-y-4">
            <ServiceReportTable 
              data={isServiceDataArray(currentPeriodData) ? currentPeriodData : []}
              isLoading={isLoading}
              dateRange={filters.dateRange}
            />
          </TabsContent>
          
          <TabsContent value="technician" className="space-y-4">
            <TechnicianReportTable 
              data={isTechnicianDataArray(currentPeriodData) ? currentPeriodData : []}
              isLoading={isLoading}
              dateRange={filters.dateRange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsDashboard;
