
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
  order_number: number;
  status: string;
  created_at: string;
  updated_at?: string;
  total_amount: number;
  description?: string;
  technician_notes?: string;
  estimated_completion_date?: string;
  customer_id: string;
  vehicle_id: string;
  customers: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  } | null;
  vehicles: {
    id: string;
    make: string;
    model: string;
    year?: number;
    license_plate: string | null;
    color?: string;
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
