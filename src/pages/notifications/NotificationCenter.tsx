
import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AppLayout } from '@/components/layout/AppLayout';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { NotificationFiltersComponent } from '@/components/notifications/NotificationFilters';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationFilters } from '@/types/notification-types';

const NotificationCenter = () => {
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    status: 'all'
  });
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading 
  } = useNotifications(filters);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    const newSelected = new Set(selectedNotifications);
    if (checked) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const allSelected = notifications.length > 0 && selectedNotifications.size === notifications.length;
  const someSelected = selectedNotifications.size > 0;

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6" />
                <CardTitle>Central de Notificações</CardTitle>
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                    {unreadCount} não lidas
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {someSelected && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                      <Check className="h-4 w-4 mr-1" />
                      Marcar como lida ({selectedNotifications.size})
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir ({selectedNotifications.size})
                    </Button>
                  </>
                )}
                <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
                  Marcar todas como lidas
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <NotificationFiltersComponent 
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            {notifications.length > 0 && (
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    Selecionar todas ({notifications.length})
                  </span>
                </div>
              </div>
            )}
            
            <div className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  Carregando notificações...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma notificação encontrada
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 hover:bg-gray-50">
                    <div className="p-4">
                      <Checkbox
                        checked={selectedNotifications.has(notification.id)}
                        onCheckedChange={(checked) => 
                          handleSelectNotification(notification.id, checked as boolean)
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        showActions={false}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default NotificationCenter;
