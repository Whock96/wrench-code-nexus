
export interface Notification {
  id: string;
  shop_id: string;
  user_id: string | null;
  title: string;
  content: string;
  type: 'system' | 'service_order_status' | 'service_order_approval' | 'maintenance_reminder' | 'appointment_reminder' | 'new_message' | 'low_stock';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  link: string | null;
  read: boolean;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
  metadata: Record<string, any>;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  shop_id: string;
  notification_type: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceAlertRule {
  id: string;
  shop_id: string;
  vehicle_id: string | null;
  service_type: string;
  description: string | null;
  km_interval: number | null;
  time_interval_days: number | null;
  alert_threshold_km: number;
  alert_threshold_days: number;
  last_service_km: number | null;
  last_service_date: string | null;
  next_service_due_km: number | null;
  next_service_due_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  type: string;
  status: 'all' | 'read' | 'unread';
  dateRange?: { from: Date; to?: Date };
}

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  system: 'Sistema',
  service_order_status: 'Status da OS',
  service_order_approval: 'Aprovação de OS',
  maintenance_reminder: 'Lembrete de Manutenção',
  appointment_reminder: 'Lembrete de Agendamento',
  new_message: 'Nova Mensagem',
  low_stock: 'Estoque Baixo'
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};
