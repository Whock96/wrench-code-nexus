
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoreVertical, Check, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationIndicator } from './NotificationIndicator';
import { NOTIFICATION_TYPE_LABELS, PRIORITY_COLORS } from '@/types/notification-types';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications(undefined, 5);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setIsOpen(false);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <NotificationIndicator onClick={() => setIsOpen(!isOpen)} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Marcar todas como lidas
            </Button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[notification.priority]}`} />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {NOTIFICATION_TYPE_LABELS[notification.type]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(notification.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewAll} className="p-3 text-center justify-center">
          <Eye className="h-4 w-4 mr-1" />
          Ver todas as notificações
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
