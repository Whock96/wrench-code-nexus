
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  ReportType, 
  ReportFilters, 
  ProcessedReportData,
  OverviewData,
  CustomerData,
  VehicleData,
  ServiceData,
  TechnicianData
} from "@/types/report-types";

// Hook principal para dados de relatório com cache
export function useCachedReportData(
  reportType: ReportType,
  filters: ReportFilters
): {
  data: ProcessedReportData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refreshData: () => void;
  clearReportCache: () => void;
} {
  const queryClient = useQueryClient();
  
  // Gerar uma chave única para o cache baseada no tipo de relatório e filtros
  const cacheKey = useMemo(() => {
    const { dateRange, customerId, vehicleId, technicianId, status, serviceType, minAmount, maxAmount } = filters;
    
    return [
      "report",
      reportType,
      dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "all",
      dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "today",
      customerId || "all",
      vehicleId || "all",
      technicianId || "all",
      status || "all",
      serviceType || "all",
      minAmount || "0",
      maxAmount || "max"
    ];
  }, [reportType, filters]);
  
  // Função para buscar dados com base no tipo de relatório e filtros
  const fetchReportData = async (): Promise<ProcessedReportData> => {
    const { dateRange, customerId, vehicleId, technicianId, status, serviceType, minAmount, maxAmount } = filters;
    
    if (!dateRange?.from) {
      throw new Error("Data inicial é obrigatória");
    }
    
    const fromDate = dateRange.from.toISOString();
    const toDate = dateRange.to ? dateRange.to.toISOString() : new Date().toISOString();
    
    try {
      // Dados de comparação com período anterior (se solicitado)
      let comparisonData = null;
      if (filters.compareWithPreviousPeriod && dateRange.from && dateRange.to) {
        const daysDiff = Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        const previousFromDate = subDays(dateRange.from, daysDiff).toISOString();
        const previousToDate = subDays(dateRange.from, 1).toISOString();
        
        comparisonData = await fetchDataForPeriod(
          reportType, 
          previousFromDate, 
          previousToDate, 
          customerId, 
          vehicleId, 
          technicianId, 
          status, 
          serviceType, 
          minAmount, 
          maxAmount
        );
      }
      
      // Dados do período atual
      const currentData = await fetchDataForPeriod(
        reportType, 
        fromDate, 
        toDate, 
        customerId, 
        vehicleId, 
        technicianId, 
        status, 
        serviceType, 
        minAmount, 
        maxAmount
      );
      
      return {
        currentPeriod: currentData,
        previousPeriod: comparisonData,
        comparisonEnabled: !!filters.compareWithPreviousPeriod
      };
    } catch (error) {
      console.error(`Error fetching ${reportType} report:`, error);
      throw error;
    }
  };
  
  // Função auxiliar para buscar dados para um período específico
  const fetchDataForPeriod = async (
    type: ReportType,
    fromDate: string,
    toDate: string,
    customerId?: string,
    vehicleId?: string,
    technicianId?: string,
    status?: string,
    serviceType?: string,
    minAmount?: number,
    maxAmount?: number
  ): Promise<OverviewData | CustomerData[] | VehicleData[] | ServiceData[] | TechnicianData[]> => {
    // Base query para filtrar por período
    let query = supabase
      .from("service_orders")
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        updated_at,
        customer_id,
        vehicle_id,
        technician_notes,
        customers (id, name, email, phone),
        vehicles (id, license_plate, make, model, year),
        service_items (id, description, item_type, quantity, unit_price, total_price)
      `)
      .gte("created_at", fromDate)
      .lte("created_at", toDate);
    
    // Aplicar filtros adicionais se fornecidos
    if (customerId) {
      query = query.eq("customer_id", customerId);
    }
    
    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId);
    }
    
    if (status) {
      query = query.eq("status", status);
    }
    
    if (minAmount) {
      query = query.gte("total_amount", minAmount);
    }
    
    if (maxAmount) {
      query = query.lte("total_amount", maxAmount);
    }
    
    // Buscar os dados
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Filtrar por tipo de serviço se necessário (precisa ser feito no cliente)
    let filteredData = data || [];
    if (serviceType && filteredData.length > 0) {
      filteredData = filteredData.filter(order => 
        order.service_items?.some(item => 
          item.item_type === serviceType || item.description.toLowerCase().includes(serviceType.toLowerCase())
        )
      );
    }
    
    // Processar os dados com base no tipo de relatório
    switch (type) {
      case "overview":
        return processOverviewData(filteredData);
      case "customer":
        return processCustomerData(filteredData);
      case "vehicle":
        return processVehicleData(filteredData);
      case "service":
        return processServiceData(filteredData);
      case "technician":
        return processTechnicianData(filteredData);
      default:
        return filteredData as any;
    }
  };
  
  // Funções de processamento para cada tipo de relatório
  const processOverviewData = (data: any[]): OverviewData => {
    // Total de OS
    const totalOrders = data.length;
    
    // Total de OS por status
    const ordersByStatus = data.reduce((acc: Record<string, number>, order) => {
      const status = order.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    // Faturamento total
    const totalRevenue = data.reduce((sum, order) => {
      return sum + (order.total_amount || 0);
    }, 0);
    
    // Faturamento por mês
    const revenueByMonth: Record<string, number> = {};
    data.forEach(order => {
      if (order.created_at && order.total_amount) {
        const month = format(parseISO(order.created_at), "yyyy-MM");
        revenueByMonth[month] = (revenueByMonth[month] || 0) + order.total_amount;
      }
    });
    
    // Ticket médio
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalOrders,
      ordersByStatus,
      totalRevenue,
      revenueByMonth,
      averageTicket
    };
  };
  
  const processCustomerData = (data: any[]): CustomerData[] => {
    // Agrupar por cliente
    const customerMap = new Map<string, CustomerData>();
    
    data.forEach(order => {
      const customerId = order.customer_id;
      const customerName = order.customers?.name || "Cliente Desconhecido";
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: customerName,
          email: order.customers?.email || "",
          phone: order.customers?.phone || "",
          totalOrders: 0,
          totalRevenue: 0,
          lastServiceDate: "",
          orders: []
        });
      }
      
      const customerData = customerMap.get(customerId)!;
      customerData.totalOrders += 1;
      customerData.totalRevenue += (order.total_amount || 0);
      
      // Atualizar a data do último serviço se for mais recente
      const orderDate = order.created_at;
      if (orderDate) {
        if (!customerData.lastServiceDate || new Date(orderDate) > new Date(customerData.lastServiceDate)) {
          customerData.lastServiceDate = orderDate;
        }
      }
      
      customerData.orders.push(order);
    });
    
    // Converter para array e ordenar por receita
    return Array.from(customerMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };
  
  const processVehicleData = (data: any[]): VehicleData[] => {
    // Agrupar por veículo
    const vehicleMap = new Map<string, VehicleData>();
    
    data.forEach(order => {
      const vehicleId = order.vehicle_id;
      const vehicleInfo = order.vehicles || {};
      
      if (!vehicleMap.has(vehicleId)) {
        vehicleMap.set(vehicleId, {
          id: vehicleId,
          licensePlate: vehicleInfo.license_plate || "N/A",
          make: vehicleInfo.make || "N/A",
          model: vehicleInfo.model || "N/A",
          year: vehicleInfo.year || "N/A",
          customerName: order.customers?.name || "Cliente Desconhecido",
          totalOrders: 0,
          totalRevenue: 0,
          lastServiceDate: "",
          orders: []
        });
      }
      
      const vehicleData = vehicleMap.get(vehicleId)!;
      vehicleData.totalOrders += 1;
      vehicleData.totalRevenue += (order.total_amount || 0);
      
      // Atualizar a data do último serviço se for mais recente
      const orderDate = order.created_at;
      if (orderDate) {
        if (!vehicleData.lastServiceDate || new Date(orderDate) > new Date(vehicleData.lastServiceDate)) {
          vehicleData.lastServiceDate = orderDate;
        }
      }
      
      vehicleData.orders.push(order);
    });
    
    // Converter para array e ordenar por receita
    return Array.from(vehicleMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };
  
  const processServiceData = (data: any[]): ServiceData[] => {
    // Extrair todos os itens de serviço
    const allItems: any[] = [];
    data.forEach(order => {
      const items = order.service_items || [];
      items.forEach((item: any) => {
        allItems.push({
          ...item,
          order_id: order.id,
          order_number: order.order_number,
          order_date: order.created_at
        });
      });
    });
    
    // Agrupar por tipo de serviço/item
    const serviceMap = new Map<string, ServiceData>();
    
    allItems.forEach(item => {
      const itemKey = `${item.item_type}-${item.description}`;
      
      if (!serviceMap.has(itemKey)) {
        serviceMap.set(itemKey, {
          type: item.item_type,
          description: item.description,
          totalQuantity: 0,
          totalRevenue: 0,
          occurrences: 0,
          items: []
        });
      }
      
      const serviceData = serviceMap.get(itemKey)!;
      serviceData.totalQuantity += (item.quantity || 1);
      serviceData.totalRevenue += (item.total_price || 0);
      serviceData.occurrences += 1;
      serviceData.items.push(item);
    });
    
    // Converter para array e ordenar por receita
    return Array.from(serviceMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };
  
  const processTechnicianData = (data: any[]): TechnicianData[] => {
    // Este é um placeholder - em um sistema real, você teria uma tabela de técnicos
    // Por enquanto, vamos extrair informações dos técnicos das notas
    const technicianMap = new Map<string, TechnicianData>();
    
    data.forEach(order => {
      // Extrair nome do técnico das notas (simulação)
      let techName = "Não atribuído";
      const notes = order.technician_notes || "";
      
      // Simulação: procurar por "Técnico: Nome" nas notas
      const techMatch = notes.match(/Técnico:\s*([^,\n]+)/i);
      if (techMatch && techMatch[1]) {
        techName = techMatch[1].trim();
      }
      
      if (!technicianMap.has(techName)) {
        technicianMap.set(techName, {
          name: techName,
          totalOrders: 0,
          totalRevenue: 0,
          completedOrders: 0,
          pendingOrders: 0,
          orders: []
        });
      }
      
      const techData = technicianMap.get(techName)!;
      techData.totalOrders += 1;
      techData.totalRevenue += (order.total_amount || 0);
      
      if (order.status === "completed") {
        techData.completedOrders += 1;
      } else if (["pending", "approved", "in_progress", "waiting_parts"].includes(order.status)) {
        techData.pendingOrders += 1;
      }
      
      techData.orders.push(order);
    });
    
    // Converter para array e ordenar por número de ordens
    return Array.from(technicianMap.values())
      .sort((a, b) => b.totalOrders - a.totalOrders);
  };
  
  // Usar React Query para cache inteligente
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: cacheKey,
    queryFn: fetchReportData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 1
  });
  
  // Tratamento de erro via useEffect
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Erro ao carregar relatório",
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados do relatório",
        variant: "destructive"
      });
    }
  }, [isError, error]);
  
  // Função para forçar atualização dos dados
  const refreshData = () => {
    toast({
      title: "Atualizando relatório",
      description: "Buscando dados mais recentes...",
    });
    refetch();
  };
  
  // Limpar cache de relatórios
  const clearReportCache = () => {
    queryClient.invalidateQueries({ queryKey: ["report"] });
    toast({
      title: "Cache limpo",
      description: "Os dados serão recarregados na próxima consulta",
    });
  };
  
  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refreshData,
    clearReportCache
  };
}
