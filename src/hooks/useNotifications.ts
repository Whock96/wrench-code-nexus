
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Notification, NotificationFilters } from '@/types/notification-types';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  highestPriority: string;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refetch: () => void;
}

export const useNotifications = (
  filters?: NotificationFilters,
  limit: number = 50
): UseNotificationsReturn => {
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user and shop
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Get user's shop
        const { data: shopUser } = await supabase
          .from('shop_users')
          .select('shop_id')
          .eq('user_id', user.id)
          .single();
        
        if (shopUser) {
          setCurrentShopId(shopUser.shop_id);
        }
      }
    };

    getCurrentUser();
  }, []);

  // Fetch notifications
  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications', currentUserId, currentShopId, filters],
    queryFn: async () => {
      if (!currentUserId || !currentShopId) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${currentUserId},user_id.is.null`)
        .eq('shop_id', currentShopId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('read', filters.status === 'read');
      }

      if (filters?.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters?.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data as Notification[];
    },
    enabled: !!currentUserId && !!currentShopId,
  });

  // Calculate unread count and highest priority
  const unreadNotifications = notifications.filter(n => !n.read);
  const unreadCount = unreadNotifications.length;
  const highestPriority = unreadNotifications.reduce((highest, notification) => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorities.indexOf(notification.priority);
    const highestIndex = priorities.indexOf(highest);
    return currentIndex > highestIndex ? notification.priority : highest;
  }, 'low');

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', currentUserId)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!currentUserId || !currentShopId) return;

    const userChannel = supabase
      .channel(`user_notifications:${currentUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUserId}`,
      }, (payload) => {
        const newNotification = payload.new as Notification;
        
        // Show toast for high priority notifications
        if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
          toast({
            title: newNotification.title,
            description: newNotification.content,
            variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
          });
        }

        // Invalidate queries to refetch
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    const shopChannel = supabase
      .channel(`shop_notifications:${currentShopId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `shop_id=eq.${currentShopId}`,
      }, () => {
        // Invalidate queries for shop notifications
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(shopChannel);
    };
  }, [currentUserId, currentShopId, queryClient, toast]);

  return {
    notifications,
    unreadCount,
    highestPriority,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    refetch,
  };
};
