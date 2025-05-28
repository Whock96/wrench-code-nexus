
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationPreference } from '@/types/notification-types';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreference[];
  isLoading: boolean;
  updatePreference: (type: string, field: 'in_app_enabled' | 'email_enabled', value: boolean) => Promise<void>;
}

export const useNotificationPreferences = (): UseNotificationPreferencesReturn => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current user and shop
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
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

  // Fetch preferences
  const { data: preferences = [], isLoading } = useQuery({
    queryKey: ['notification_preferences', currentUserId, currentShopId],
    queryFn: async () => {
      if (!currentUserId || !currentShopId) return [];

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('shop_id', currentShopId);

      if (error) {
        console.error('Error fetching preferences:', error);
        throw error;
      }

      return data as NotificationPreference[];
    },
    enabled: !!currentUserId && !!currentShopId,
  });

  // Update preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: async ({ type, field, value }: { type: string; field: string; value: boolean }) => {
      if (!currentUserId || !currentShopId) throw new Error('User not authenticated');

      // Try to update existing preference
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('shop_id', currentShopId)
        .eq('notification_type', type)
        .single();

      if (existing) {
        // Update existing preference
        const { error } = await supabase
          .from('notification_preferences')
          .update({ [field]: value })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new preference
        const newPreference = {
          user_id: currentUserId,
          shop_id: currentShopId,
          notification_type: type,
          in_app_enabled: field === 'in_app_enabled' ? value : true,
          email_enabled: field === 'email_enabled' ? value : true,
        };

        const { error } = await supabase
          .from('notification_preferences')
          .insert(newPreference);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_preferences'] });
    },
  });

  return {
    preferences,
    isLoading,
    updatePreference: async (type: string, field: 'in_app_enabled' | 'email_enabled', value: boolean) => {
      await updatePreferenceMutation.mutateAsync({ type, field, value });
    },
  };
};
