
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink } from 'lucide-react';
import { Notification, NOTIFICATION_TYPE_LABELS, PRIORITY_COLORS } from '@/types/notification-types';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showActions?: boolean;
}

export const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  showActions = true 
}: NotificationItemProps) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(notification.id);
  };

  return (
    <div 
      className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[notification.priority]}`} />
            )}
            {notification.link && (
              <ExternalLink className="h-3 w-3 text-gray-400" />
            )}
          </div>
          
          <p className="text-sm text-gray-700 mb-2">
            {notification.content}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Badge variant="outline" className="text-xs">
              {NOTIFICATION_TYPE_LABELS[notification.type]}
            </Badge>
            <span>
              {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
            {notification.priority !== 'medium' && (
              <Badge 
                variant="secondary" 
                className={`text-xs text-white ${PRIORITY_COLORS[notification.priority]}`}
              >
                {notification.priority.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
