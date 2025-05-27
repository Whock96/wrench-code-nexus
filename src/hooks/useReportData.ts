
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

export interface CustomerReportData {
  id: string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  lastServiceDate: string;
}

export interface VehicleReportData {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  customerName: string;
  totalOrders: number;
  totalRevenue: number;
  lastServiceDate: string;
}

export const useReportData = (dateRange: DateRange | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [revenueByPeriod, setRevenueByPeriod] = useState<RevenueByPeriod[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [serviceTrend, setServiceTrend] = useState<ServiceTrend[]>([]);
  const [customerReport, setCustomerReport] = useState<CustomerReportData[]>([]);
  const [vehicleReport, setVehicleReport] = useState<VehicleReportData[]>([]);
  const [isLoadingCustomerReport, setIsLoadingCustomerReport] = useState(false);
  const [isLoadingVehicleReport, setIsLoadingVehicleReport] = useState(false);

  // Status colors for consistent visualization
  const statusColors: Record<string, string> = {
    pending: "#FFA500",     // Orange
    approved: "#3498db",    // Blue
    in_progress: "#9b59b6", // Purple
    waiting_parts: "#f1c40f", // Yellow
    completed: "#2ecc71",   // Green
    canceled: "#e74c3c"     // Red
  };

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
      // Gerar array de meses no intervalo
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

  const loadCustomerReport = async (fromDate: string, toDate: string) => {
    setIsLoadingCustomerReport(true);
    try {
      // Buscar dados de clientes com ordens de serviço no período
      const { data: serviceOrders, error: serviceOrdersError } = await supabase
        .from("service_orders")
        .select(`
          id,
          total_amount,
          status,
          created_at,
          updated_at,
          customers (
            id,
            name
          )
        `)
        .gte("created_at", fromDate)
        .lte("created_at", toDate);
        
      if (serviceOrdersError) throw serviceOrdersError;
      
      // Processar os dados para o formato do relatório
      const customerReportData: CustomerReportData[] = [];
      
      // Agrupar por cliente
      const customerMap = new Map<string, {
        id: string;
        name: string;
        orders: any[];
        revenue: number;
        lastServiceDate: string;
      }>();
      
      serviceOrders?.forEach(order => {
        if (!order.customers) return;
        
        const customerId = order.customers.id;
        const customerName = order.customers.name;
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: customerName,
            orders: [],
            revenue: 0,
            lastServiceDate: ''
          });
        }
        
        const customerData = customerMap.get(customerId)!;
        customerData.orders.push(order);
        
        if (order.status === 'completed') {
          customerData.revenue += (order.total_amount || 0);
        }
        
        // Atualizar data do último serviço
        const orderDate = new Date(order.updated_at || order.created_at);
        const currentLastDate = customerData.lastServiceDate ? new Date(customerData.lastServiceDate) : new Date(0);
        if (orderDate > currentLastDate) {
          customerData.lastServiceDate = format(orderDate, 'dd/MM/yyyy', { locale: ptBR });
        }
      });
      
      // Converter o Map para array e ordenar por receita (decrescente)
      Array.from(customerMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .forEach(item => {
          customerReportData.push({
            id: item.id,
            name: item.name,
            totalOrders: item.orders.length,
            totalRevenue: item.revenue,
            lastServiceDate: item.lastServiceDate
          });
        });
      
      setCustomerReport(customerReportData);
    } catch (error) {
      console.error("Error loading customer report:", error);
      setCustomerReport([]);
    } finally {
      setIsLoadingCustomerReport(false);
    }
  };

  const loadVehicleReport = async (fromDate: string, toDate: string) => {
    setIsLoadingVehicleReport(true);
    try {
      // Buscar dados de veículos com ordens de serviço no período
      const { data: serviceOrders, error: serviceOrdersError } = await supabase
        .from("service_orders")
        .select(`
          id,
          total_amount,
          status,
          created_at,
          updated_at,
          vehicles (
            id,
            license_plate,
            make,
            model,
            year
          ),
          customers (
            id,
            name
          )
        `)
        .gte("created_at", fromDate)
        .lte("created_at", toDate);
        
      if (serviceOrdersError) throw serviceOrdersError;
      
      // Processar os dados para o formato do relatório
      const vehicleReportData: VehicleReportData[] = [];
      
      // Agrupar por veículo
      const vehicleMap = new Map<string, {
        id: string;
        licensePlate: string;
        make: string;
        model: string;
        year: number;
        customerName: string;
        orders: any[];
        revenue: number;
        lastServiceDate: string;
      }>();
      
      serviceOrders?.forEach(order => {
        if (!order.vehicles || !order.customers) return;
        
        const vehicleId = order.vehicles.id;
        
        if (!vehicleMap.has(vehicleId)) {
          vehicleMap.set(vehicleId, {
            id: vehicleId,
            licensePlate: order.vehicles.license_plate || 'N/A',
            make: order.vehicles.make,
            model: order.vehicles.model,
            year: order.vehicles.year || 0,
            customerName: order.customers.name,
            orders: [],
            revenue: 0,
            lastServiceDate: ''
          });
        }
        
        const vehicleData = vehicleMap.get(vehicleId)!;
        vehicleData.orders.push(order);
        
        if (order.status === 'completed') {
          vehicleData.revenue += (order.total_amount || 0);
        }
        
        // Atualizar data do último serviço
        const orderDate = new Date(order.updated_at || order.created_at);
        const currentLastDate = vehicleData.lastServiceDate ? new Date(vehicleData.lastServiceDate) : new Date(0);
        if (orderDate > currentLastDate) {
          vehicleData.lastServiceDate = format(orderDate, 'dd/MM/yyyy', { locale: ptBR });
        }
      });
      
      // Converter o Map para array e ordenar por receita (decrescente)
      Array.from(vehicleMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .forEach(item => {
          vehicleReportData.push({
            id: item.id,
            licensePlate: item.licensePlate,
            make: item.make,
            model: item.model,
            year: item.year,
            customerName: item.customerName,
            totalOrders: item.orders.length,
            totalRevenue: item.revenue,
            lastServiceDate: item.lastServiceDate
          });
        });
      
      setVehicleReport(vehicleReportData);
    } catch (error) {
      console.error("Error loading vehicle report:", error);
      setVehicleReport([]);
    } finally {
      setIsLoadingVehicleReport(false);
    }
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
        
        // 5. Load custom reports
        await loadCustomerReport(fromDate, toDate);
        await loadVehicleReport(fromDate, toDate);
        
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportData();
  }, [dateRange]);

  return {
    isLoading,
    stats,
    revenueByPeriod,
    statusDistribution,
    serviceTrend,
    customerReport,
    vehicleReport,
    isLoadingCustomerReport,
    isLoadingVehicleReport
  };
};
