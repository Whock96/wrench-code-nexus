
export type ReportType = 
  | "overview" 
  | "customer" 
  | "vehicle" 
  | "service" 
  | "technician";

// Interface para filtros avançados
export interface ReportFilters {
  dateRange: { from: Date; to?: Date } | undefined;
  customerId?: string;
  vehicleId?: string;
  technicianId?: string;
  status?: string;
  serviceType?: string;
  minAmount?: number;
  maxAmount?: number;
  compareWithPreviousPeriod?: boolean;
}

// Interface para dados de visão geral
export interface OverviewData {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalRevenue: number;
  revenueByMonth: Record<string, number>;
  averageTicket: number;
}

// Interface para dados de cliente
export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalRevenue: number;
  orders: any[];
  lastServiceDate?: string;
}

// Interface para dados de veículo
export interface VehicleData {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: string | number;
  customerName: string;
  totalOrders: number;
  totalRevenue: number;
  orders: any[];
}

// Interface para dados de serviço
export interface ServiceData {
  type: string;
  description: string;
  totalQuantity: number;
  totalRevenue: number;
  occurrences: number;
  items: any[];
}

// Interface para dados de técnico
export interface TechnicianData {
  name: string;
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  orders: any[];
}

// Interface para resultado do processamento de dados
export interface ProcessedReportData {
  currentPeriod: OverviewData | CustomerData[] | VehicleData[] | ServiceData[] | TechnicianData[];
  previousPeriod: OverviewData | CustomerData[] | VehicleData[] | ServiceData[] | TechnicianData[] | null;
  comparisonEnabled: boolean;
}

// Type guards para verificar o tipo de dados
export function isOverviewData(data: any): data is OverviewData {
  return data && 
    typeof data.totalRevenue === 'number' && 
    typeof data.totalOrders === 'number' &&
    typeof data.averageTicket === 'number' &&
    typeof data.ordersByStatus === 'object' &&
    typeof data.revenueByMonth === 'object';
}

export function isCustomerDataArray(data: any): data is CustomerData[] {
  return Array.isArray(data) && 
    (data.length === 0 || (data.length > 0 && 
    data[0] && 
    typeof data[0].id === 'string' && 
    typeof data[0].name === 'string' &&
    typeof data[0].totalRevenue === 'number'));
}

export function isVehicleDataArray(data: any): data is VehicleData[] {
  return Array.isArray(data) && 
    (data.length === 0 || (data.length > 0 && 
    data[0] && 
    typeof data[0].id === 'string' && 
    typeof data[0].licensePlate === 'string' &&
    typeof data[0].totalRevenue === 'number'));
}

export function isServiceDataArray(data: any): data is ServiceData[] {
  return Array.isArray(data) && 
    (data.length === 0 || (data.length > 0 && 
    data[0] && 
    typeof data[0].type === 'string' && 
    typeof data[0].description === 'string' &&
    typeof data[0].totalRevenue === 'number'));
}

export function isTechnicianDataArray(data: any): data is TechnicianData[] {
  return Array.isArray(data) && 
    (data.length === 0 || (data.length > 0 && 
    data[0] && 
    typeof data[0].name === 'string' && 
    typeof data[0].totalOrders === 'number' &&
    typeof data[0].totalRevenue === 'number'));
}
