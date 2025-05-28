
import { Settings, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { PreferenceCard } from '@/components/settings/PreferenceCard';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { NOTIFICATION_TYPE_LABELS } from '@/types/notification-types';

const NotificationPreferencesPage = () => {
  const { preferences, isLoading, updatePreference } = useNotificationPreferences();

  const notificationTypes = Object.keys(NOTIFICATION_TYPE_LABELS);

  const getPreference = (type: string) => {
    return preferences.find(p => p.notification_type === type) || {
      in_app_enabled: true,
      email_enabled: true,
    };
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="text-center">Carregando preferências...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <CardTitle>Preferências de Notificação</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Configure como e quando você deseja receber notificações para cada tipo de evento.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notificationTypes.map((type) => {
            const preference = getPreference(type);
            return (
              <PreferenceCard
                key={type}
                type={type}
                inAppEnabled={preference.in_app_enabled}
                emailEnabled={preference.email_enabled}
                onInAppChange={(enabled) => updatePreference(type, 'in_app_enabled', enabled)}
                onEmailChange={(enabled) => updatePreference(type, 'email_enabled', enabled)}
              />
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default NotificationPreferencesPage;
