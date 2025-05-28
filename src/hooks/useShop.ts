
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useShop = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };

    getCurrentUser();
  }, []);

  const { data: shopData } = useQuery({
    queryKey: ['current-shop', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return null;

      const { data: shopUser } = await supabase
        .from('shop_users')
        .select('shop_id, role')
        .eq('user_id', currentUserId)
        .single();

      return shopUser;
    },
    enabled: !!currentUserId,
  });

  return {
    shopId: shopData?.shop_id || null,
    userRole: shopData?.role || null,
    isAdmin: shopData?.role === 'admin',
    isManager: shopData?.role === 'manager' || shopData?.role === 'admin',
  };
};
