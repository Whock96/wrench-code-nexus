
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileText, DollarSign, Users, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

interface ReportStats {
  totalRevenue: number;
  totalServiceOrders: number;
  totalCompletedOrders: number;
  totalClients: number;
  totalVehicles: number;
}

const ReportsDashboard: React.FC = () => {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const { toast } = useToast();

  useEffect(() => {
    loadReportStats();
  }, [dateRange]);

  const loadReportStats = async () => {
    setIsLoading(true);
    try {
      const fromDate = dateRange?.from?.toISOString();
      const toDate = dateRange?.to?.toISOString();

      // Query para Faturamento Total (OS Concluídas no período)
      const { data: revenueData, error: revenueError } = await supabase
        .from("service_orders")
        .select("total_amount")
        .eq("status", "completed")
        .gte("updated_at", fromDate)
        .lte("updated_at", toDate);
      if (revenueError) throw revenueError;
      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Query para Total de OS Criadas no período
      const { count: totalServiceOrders, error: osError } = await supabase
        .from("service_orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", fromDate)
        .lte("created_at", toDate);
      if (osError) throw osError;

      // Query para Total de OS Concluídas no período
      const { count: totalCompletedOrders, error: completedOsError } = await supabase
        .from("service_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("updated_at", fromDate)
        .lte("updated_at", toDate);
      if (completedOsError) throw completedOsError;
      
      // Query para Total de Clientes (geral, não por período)
      const { count: totalClients, error: clientError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      if (clientError) throw clientError;

      // Query para Total de Veículos (geral, não por período)
      const { count: totalVehicles, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true });
      if (vehicleError) throw vehicleError;

      setStats({
        totalRevenue,
        totalServiceOrders: totalServiceOrders || 0,
        totalCompletedOrders: totalCompletedOrders || 0,
        totalClients: totalClients || 0,
        totalVehicles: totalVehicles || 0,
      });

    } catch (error: any) {
      console.error("Error loading report stats:", error);
      toast({
        title: "Erro ao carregar estatísticas",
        description: "Não foi possível carregar os dados para os relatórios.",
        variant: "destructive",
      });
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h2>
          <div className="flex items-center space-x-2">
            <DateRangePicker date={dateRange} onUpdate={(range) => setDateRange(range.range)} />
            <Button onClick={loadReportStats} disabled={isLoading}>
              {isLoading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>
        </div>

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

        {/* Placeholder para futuros relatórios e gráficos */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Relatórios</CardTitle>
              <CardDescription>
                Em breve: Relatórios detalhados de faturamento, serviços, clientes e gráficos interativos.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-10">
              (Conteúdo dos relatórios será adicionado nos próximos prompts)
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsDashboard;
