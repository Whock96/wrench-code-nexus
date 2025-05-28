
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NOTIFICATION_TYPE_LABELS } from '@/types/notification-types';

interface PreferenceCardProps {
  type: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  onInAppChange: (enabled: boolean) => void;
  onEmailChange: (enabled: boolean) => void;
}

export const PreferenceCard = ({ 
  type, 
  inAppEnabled, 
  emailEnabled, 
  onInAppChange, 
  onEmailChange 
}: PreferenceCardProps) => {
  const label = NOTIFICATION_TYPE_LABELS[type] || type;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
        <CardDescription>
          Configure como você deseja receber notificações deste tipo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notificações no app</p>
            <p className="text-sm text-gray-500">
              Receber notificações dentro do aplicativo
            </p>
          </div>
          <Switch
            checked={inAppEnabled}
            onCheckedChange={onInAppChange}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Notificações por email</p>
            <p className="text-sm text-gray-500">
              Receber notificações por email
            </p>
          </div>
          <Switch
            checked={emailEnabled}
            onCheckedChange={onEmailChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
