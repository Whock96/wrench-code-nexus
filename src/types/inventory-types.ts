// Interfaces para o módulo de estoque e peças
export interface Part {
  id: string;
  shop_id: string;
  sku: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  manufacturer?: string | null;
  compatible_models?: string | null;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  location?: string | null;
  barcode?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PartCategory {
  id: string;
  shop_id: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  created_at: string;
  subcategories?: PartCategory[];
}

export interface StockMovement {
  id: string;
  part_id: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'return';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_price?: number | null;
  total_price?: number | null;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Supplier {
  id: string;
  shop_id: string;
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  tax_id?: string | null;
  payment_terms?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface PartSupplier {
  id: string;
  part_id: string;
  supplier_id: string;
  supplier_sku?: string | null;
  cost_price?: number | null;
  lead_time_days?: number | null;
  minimum_order_quantity: number;
  is_preferred: boolean;
  created_at: string;
}

// Interfaces estendidas para relacionamentos
export interface PartWithRelations extends Part {
  category?: PartCategory | null;
  suppliers?: PartSupplier[] | null;
  stock_movements?: StockMovement[] | null;
}

export interface SupplierWithParts extends Supplier {
  parts?: PartSupplier[] | null;
}

// Interfaces para formulários
export interface PartFormData {
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  manufacturer?: string;
  compatible_models?: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  location?: string;
  barcode?: string;
  image_url?: string;
}

export interface StockMovementFormData {
  part_id: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'return';
  quantity: number;
  unit_price?: number;
  notes?: string;
}

export interface SupplierFormData {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: string;
  notes?: string;
}

// Tipos para dashboards e relatórios
export interface InventoryStats {
  totalParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  totalValue: number;
  totalMovements: number;
}

export interface StockAlert {
  id: string;
  part_id: string;
  part_name: string;
  part_sku: string;
  current_stock: number;
  minimum_stock: number;
  shortage: number;
  priority: 'low' | 'medium' | 'high';
}

export interface MovementSummary {
  type: 'entry' | 'exit' | 'adjustment' | 'return';
  count: number;
  totalQuantity: number;
  totalValue: number;
}
