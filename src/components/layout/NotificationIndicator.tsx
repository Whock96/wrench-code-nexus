
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { PRIORITY_COLORS } from '@/types/notification-types';

interface NotificationIndicatorProps {
  onClick: () => void;
}

export const NotificationIndicator = ({ onClick }: NotificationIndicatorProps) => {
  const { unreadCount, highestPriority } = useNotifications(undefined, 5);

  const badgeColor = unreadCount > 0 ? PRIORITY_COLORS[highestPriority] : 'bg-gray-500';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs text-white ${badgeColor}`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
