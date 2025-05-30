
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Clock, Car, User, FileText, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ServiceOrderWithRelations, StatusHistoryItem } from "@/types/supabase";
import { QRCodeGenerator } from "@/components/service-orders/QRCodeGenerator";
import { StatusHistoryTimeline } from "@/components/service-orders/StatusHistoryTimeline";
import { useAuth } from "@/contexts/AuthContext";

const statusMap = {
  pending: { label: "Pendente", variant: "secondary" as const },
  approved: { label: "Aprovado", variant: "default" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  waiting_parts: { label: "Aguardando Peças", variant: "outline" as const },
  completed: { label: "Concluído", variant: "default" as const },
  canceled: { label: "Cancelado", variant: "destructive" as const },
};

const ServiceOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [serviceOrder, setServiceOrder] = useState<ServiceOrderWithRelations | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadServiceOrder(id);
      loadStatusHistory(id);
    }
  }, [id]);

  const loadServiceOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          customers (*),
          vehicles (*)
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setServiceOrder(data as ServiceOrderWithRelations);
    } catch (error: any) {
      console.error("Error loading service order:", error);
      toast({
        title: "Erro ao carregar ordem de serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatusHistory = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("service_order_status_history")
        .select("*")
        .eq("service_order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStatusHistory(data as StatusHistoryItem[]);
    } catch (error: any) {
      console.error("Error loading status history:", error);
      toast({
        title: "Erro ao carregar histórico de status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePublicAccess = async (enabled: boolean) => {
    if (!serviceOrder) return;

    try {
      const { error } = await supabase
        .from("service_orders")
        .update({ public_access_enabled: enabled })
        .eq("id", serviceOrder.id);

      if (error) throw error;
      
      setServiceOrder({ 
        ...serviceOrder, 
        public_access_enabled: enabled 
      });
    } catch (error: any) {
      console.error("Error updating public access:", error);
      throw error;
    }
  };

  const handleUpdateStatus = async (newStatus: string, notes?: string) => {
    if (!serviceOrder) return;

    try {
      // Atualizar o status da ordem de serviço
      const { error: updateError } = await supabase
        .from("service_orders")
        .update({ 
          status: newStatus,
          last_status_update: new Date().toISOString()
        })
        .eq("id", serviceOrder.id);

      if (updateError) throw updateError;

      // Adicionar entrada no histórico manualmente
      const { error: historyError } = await supabase
        .from("service_order_status_history")
        .insert({
          service_order_id: serviceOrder.id,
          status: newStatus,
          change_reason: notes || null,
          created_by: user?.id
        });

      if (historyError) throw historyError;

      // Atualizar o estado local
      setServiceOrder({ 
        ...serviceOrder, 
        status: newStatus, 
        last_status_update: new Date().toISOString() 
      });
      
      // Recarregar o histórico
      loadStatusHistory(serviceOrder.id);

      toast({
        title: "Status atualizado",
        description: `O status da ordem de serviço foi atualizado para ${statusMap[newStatus as keyof typeof statusMap]?.label || newStatus}.`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!serviceOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Ordem de serviço não encontrada</h2>
        <p className="text-muted-foreground mb-4">A ordem de serviço solicitada não existe ou foi removida.</p>
        <Button asChild>
          <Link to="/service-orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista
          </Link>
        </Button>
      </div>
    );
  }

  const status = serviceOrder.status as keyof typeof statusMap;
  const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/service-orders" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">Ordem de Serviço #{serviceOrder.order_number}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <span className="text-sm text-muted-foreground">
              Criada em {new Date(serviceOrder.created_at!).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/service-orders/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Service Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Ordem de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Cliente</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {serviceOrder.customers ? (
                      <Link to={`/clients/${serviceOrder.customers.id}`} className="font-medium hover:underline">
                        {serviceOrder.customers.name}
                      </Link>
                    ) : (
                      <span>Cliente não encontrado</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Veículo</div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    {serviceOrder.vehicles ? (
                      <Link to={`/vehicles/${serviceOrder.vehicles.id}`} className="font-medium hover:underline">
                        {serviceOrder.vehicles.make} {serviceOrder.vehicles.model} {serviceOrder.vehicles.year}
                        {serviceOrder.vehicles.license_plate && ` - ${serviceOrder.vehicles.license_plate}`}
                      </Link>
                    ) : (
                      <span>Veículo não encontrado</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Data de Criação</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(serviceOrder.created_at!).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Previsão de Conclusão</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {serviceOrder.estimated_completion_date
                        ? new Date(serviceOrder.estimated_completion_date).toLocaleDateString()
                        : "Não definida"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      R$ {Number(serviceOrder.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Última Atualização</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {serviceOrder.last_status_update
                        ? new Date(serviceOrder.last_status_update).toLocaleString()
                        : new Date(serviceOrder.created_at!).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Descrição</div>
                <div className="p-3 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground float-left mr-2 mt-1" />
                  <p className="whitespace-pre-wrap">{serviceOrder.description || "Sem descrição"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Atualizar Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(statusMap).map(([key, { label, variant }]) => (
                  <Button
                    key={key}
                    variant={key === serviceOrder.status ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleUpdateStatus(key)}
                    disabled={key === serviceOrder.status}
                  >
                    <Badge variant={variant} className="mr-2">
                      {label.charAt(0).toUpperCase()}
                    </Badge>
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <StatusHistoryTimeline history={statusHistory} />
        </div>

        <div className="space-y-6">
          {/* QR Code */}
          <QRCodeGenerator
            serviceOrderId={serviceOrder.id}
            qrCodeToken={serviceOrder.qr_code_token || ""}
            publicAccessEnabled={serviceOrder.public_access_enabled || false}
            onAccessToggle={handleTogglePublicAccess}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderDetail;
