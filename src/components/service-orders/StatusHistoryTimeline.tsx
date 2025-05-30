
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatusHistoryItem {
  id: string;
  status: string;
  changed_at: string; // Corrigido: usar changed_at do banco
  change_reason?: string | null;
}

interface StatusHistoryTimelineProps {
  history: StatusHistoryItem[];
  className?: string;
}

const statusMap = {
  pending: { label: "Pendente", variant: "secondary" as const },
  approved: { label: "Aprovado", variant: "default" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  waiting_parts: { label: "Aguardando Peças", variant: "outline" as const },
  completed: { label: "Concluído", variant: "default" as const },
  canceled: { label: "Cancelado", variant: "destructive" as const },
};

export const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({ 
  history,
  className = ""
}) => {
  if (!history || history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Nenhuma atualização de status registrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar do mais recente para o mais antigo
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Histórico de Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-8 border-l border-border">
          {sortedHistory.map((item, index) => {
            const status = item.status as keyof typeof statusMap;
            const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };
            
            return (
              <div key={item.id} className={`mb-8 last:mb-0 relative`}>
                <div className="absolute -left-[25px] mt-1.5 h-4 w-4 rounded-full bg-primary border-4 border-background"></div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.changed_at).toLocaleString()}
                    </span>
                  </div>
                  {item.change_reason && (
                    <p className="text-sm mt-1">{item.change_reason}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
