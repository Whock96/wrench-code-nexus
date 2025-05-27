
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportStats {
  totalRevenue: number;
  totalServiceOrders: number;
  totalCompletedOrders: number;
  totalClients: number;
  totalVehicles: number;
}

interface RevenueByPeriod {
  period: string;
  revenue: number;
}

interface StatusDistribution {
  status: string;
  count: number;
  color: string;
}

interface ServiceTrend {
  period: string;
  created: number;
  completed: number;
}

export const useReportData = (dateRange: DateRange | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [revenueByPeriod, setRevenueByPeriod] = useState<RevenueByPeriod[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [serviceTrend, setServiceTrend] = useState<ServiceTrend[]>([]);

  // Status colors for consistent visualization
  const statusColors: Record<string, string> = {
    pending: "#FFA500",     // Orange
    approved: "#3498db",    // Blue
    in_progress: "#9b59b6", // Purple
    waiting_parts: "#f1c40f", // Yellow
    completed: "#2ecc71",   // Green
    canceled: "#e74c3c"     // Red
  };

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    const loadReportData = async () => {
      setIsLoading(true);
      try {
        const fromDate = dateRange.from.toISOString();
        const toDate = dateRange.to ? dateRange.to.toISOString() : new Date().toISOString();

        // 1. Load basic stats
        await loadBasicStats(fromDate, toDate);
        
        // 2. Load revenue by period (monthly)
        await loadRevenueByPeriod(dateRange.from, dateRange.to || new Date());
        
        // 3. Load status distribution
        await loadStatusDistribution(fromDate, toDate);
        
        // 4. Load service trends
        await loadServiceTrend(dateRange.from, dateRange.to || new Date());
        
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [dateRange]);

  const loadBasicStats = async (fromDate: string, toDate: string) => {
    try {
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
    } catch (error) {
      console.error("Error loading basic stats:", error);
      setStats(null);
    }
  };

  const loadRevenueByPeriod = async (fromDate: Date, toDate: Date) => {
    try {
      // Gerar array de meses no intervalo
      const months = eachMonthOfInterval({ start: fromDate, end: toDate });
      
      const revenueData: RevenueByPeriod[] = [];
      
      // Para cada mês, buscar o faturamento
      for (const month of months) {
        const startDate = startOfMonth(month).toISOString();
        const endDate = endOfMonth(month).toISOString();
        
        const { data, error } = await supabase
          .from("service_orders")
          .select("total_amount")
          .eq("status", "completed")
          .gte("updated_at", startDate)
          .lte("updated_at", endDate);
          
        if (error) throw error;
        
        const monthlyRevenue = data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        
        revenueData.push({
          period: format(month, "MMM/yyyy", { locale: ptBR }),
          revenue: monthlyRevenue
        });
      }
      
      setRevenueByPeriod(revenueData);
    } catch (error) {
      console.error("Error loading revenue by period:", error);
      setRevenueByPeriod([]);
    }
  };

  const loadStatusDistribution = async (fromDate: string, toDate: string) => {
    try {
      // Buscar contagem de OS por status
      const { data, error } = await supabase
        .from("service_orders")
        .select("status")
        .gte("created_at", fromDate)
        .lte("created_at", toDate);
        
      if (error) throw error;
      
      // Contar ocorrências de cada status
      const statusCounts: Record<string, number> = {};
      data?.forEach(order => {
        const status = order.status || "unknown";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      // Converter para o formato esperado pelo gráfico
      const distributionData: StatusDistribution[] = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        color: statusColors[status] || "#999999" // Cor padrão para status desconhecidos
      }));
      
      setStatusDistribution(distributionData);
    } catch (error) {
      console.error("Error loading status distribution:", error);
      setStatusDistribution([]);
    }
  };

  const loadServiceTrend = async (fromDate: Date, toDate: Date) => {
    try {
      // Determinar o intervalo apropriado (diário, semanal ou mensal) com base na duração
      const months = eachMonthOfInterval({ start: fromDate, end: toDate });
      
      const trendData: ServiceTrend[] = [];
      
      for (const month of months) {
        const startDate = startOfMonth(month).toISOString();
        const endDate = endOfMonth(month).toISOString();
        
        // Contar OS criadas no mês
        const { count: createdCount, error: createdError } = await supabase
          .from("service_orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startDate)
          .lte("created_at", endDate);
          
        if (createdError) throw createdError;
        
        // Contar OS concluídas no mês
        const { count: completedCount, error: completedError } = await supabase
          .from("service_orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("updated_at", startDate)
          .lte("updated_at", endDate);
          
        if (completedError) throw completedError;
        
        trendData.push({
          period: format(month, "MMM/yyyy", { locale: ptBR }),
          created: createdCount || 0,
          completed: completedCount || 0
        });
      }
      
      setServiceTrend(trendData);
    } catch (error) {
      console.error("Error loading service trend:", error);
      setServiceTrend([]);
    }
  };

  return {
    isLoading,
    stats,
    revenueByPeriod,
    statusDistribution,
    serviceTrend
  };
};
