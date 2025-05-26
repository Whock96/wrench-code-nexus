
import { Tables } from '@/integrations/supabase/types';

// Tipos para selects parciais
export interface CustomerSelect {
  id: string;
  name: string;
}

export interface VehicleSelect {
  id: string;
  make: string;
  model: string;
  license_plate: string | null;
}

export interface ServiceOrderWithRelations {
  id: string;
  shop_id: string;
  customer_id: string;
  vehicle_id: string;
  order_number: number;
  status: string;
  description: string | null;
  technician_notes: string | null;
  estimated_completion_date: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string | null;
  customers?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  vehicles?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    license_plate?: string | null;
    color?: string | null;
  } | null;
}

// Tipos para items de serviço
export interface ServiceItem {
  id?: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  service_order_id?: string;
  created_at?: string;
}

// Tipos para histórico de status
export interface ServiceOrderStatusHistory {
  id: string;
  service_order_id: string;
  status: string;
  change_reason?: string;
  changed_at: string;
  changed_by?: string;
}

// Tipos para dashboard
export interface DashboardStats {
  clients: number;
  vehicles: number;
  serviceOrders: number;
  revenue: number;
}

export interface StatusCount {
  [key: string]: number;
}

// Tipos para Order Details
export interface ServiceOrderDetailWithRelations extends ServiceOrderWithRelations {
  service_items?: ServiceItem[];
  service_order_status_history?: ServiceOrderStatusHistory[];
}

// Tipos para formulários
export interface ServiceOrderFormData {
  customer_id: string;
  vehicle_id: string;
  description?: string;
  estimated_completion_date?: string;
  technician_notes?: string;
  items: ServiceItem[];
}

// Status types
export type ServiceOrderStatus = 
  | 'pending'
  | 'approved' 
  | 'in_progress'
  | 'waiting_parts'
  | 'completed'
  | 'canceled';

export interface StatusInfo {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color?: string;
}

export const SERVICE_ORDER_STATUS_MAP: Record<ServiceOrderStatus, StatusInfo> = {
  pending: { label: "Pendente", variant: "secondary" },
  approved: { label: "Aprovado", variant: "default" },
  in_progress: { label: "Em Andamento", variant: "default" },
  waiting_parts: { label: "Aguardando Peças", variant: "outline" },
  completed: { label: "Concluído", variant: "default" },
  canceled: { label: "Cancelado", variant: "destructive" },
};
