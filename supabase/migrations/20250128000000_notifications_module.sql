
-- Migração para o módulo de notificações
-- Criar as tabelas necessárias se não existirem

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('system', 'service_order_status', 'service_order_approval', 'maintenance_reminder', 'appointment_reminder', 'new_message', 'low_stock')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    link TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Criar tabela de preferências de notificação
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, shop_id, notification_type)
);

-- Criar tabela de logs de notificação  
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('in_app', 'email')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    recipient TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Habilitar RLS para notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY "Usuários podem ver notificações de sua oficina" 
    ON public.notifications 
    FOR SELECT 
    USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND shop_id IN (
            SELECT shop_id FROM public.shop_users WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Usuários podem atualizar notificações direcionadas a eles"
    ON public.notifications
    FOR UPDATE
    USING (user_id = auth.uid());

-- RLS para preferências de notificação
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias preferências"
    ON public.notification_preferences
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar suas próprias preferências"
    ON public.notification_preferences
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Usuários podem inserir suas próprias preferências"
    ON public.notification_preferences
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- RLS para logs de notificação
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver logs de suas notificações"
    ON public.notification_logs
    FOR SELECT
    USING (
        notification_id IN (
            SELECT id FROM public.notifications WHERE user_id = auth.uid()
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_shop_id_idx ON public.notifications(shop_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notification_preferences_user_shop_idx ON public.notification_preferences(user_id, shop_id);

-- Trigger para atualizar updated_at em notification_preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Trigger para notificações em tempo real
CREATE OR REPLACE FUNCTION notify_new_notification()
RETURNS TRIGGER AS $$
DECLARE
  channel_name text;
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    channel_name := 'user_notifications:' || NEW.user_id::text;
    PERFORM pg_notify(
      channel_name,
      json_build_object(
        'event', 'new_notification',
        'payload', row_to_json(NEW)
      )::text
    );
  END IF;
  
  channel_name := 'shop_notifications:' || NEW.shop_id::text;
  PERFORM pg_notify(
    channel_name,
    json_build_object(
      'event', 'new_shop_notification',
      'payload', row_to_json(NEW)
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_new_notification_trigger ON public.notifications;
CREATE TRIGGER notify_new_notification_trigger
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_notification();
