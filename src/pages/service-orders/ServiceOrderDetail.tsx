import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, FileText, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ServiceOrderDetailWithRelations, SERVICE_ORDER_STATUS_MAP, ServiceOrderStatusHistory } from "@/types/supabase";
import { QRCodeGenerator } from "@/components/service-orders/QRCodeGenerator";
import { StatusHistoryTimeline } from "@/components/service-orders/StatusHistoryTimeline";

const ServiceOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceOrder, setServiceOrder] = useState<ServiceOrderDetailWithRelations | null>(null);
  const [statusHistory, setStatusHistory] = useState<ServiceOrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);

  useEffect(() => {
    if (id) {
      loadServiceOrder();
    }
  }, [id]);

  const loadServiceOrder = async () => {
    try {
      // Carregar ordem de serviço com relacionamentos
      const { data: orderData, error: orderError } = await supabase
        .from("service_orders")
        .select(`
          *,
          customers (id, name, email, phone),
          vehicles (id, make, model, year, license_plate, color),
          service_items (*),
          service_order_status_history (*)
        `)
        .eq("id", id)
        .single();

      if (orderError) throw orderError;

      if (orderData) {
        // Processar histórico de status - CORRIGIDO para usar campos corretos
        const history = (orderData.service_order_status_history || []).map((item: any) => ({
          id: item.id,
          service_order_id: item.service_order_id,
          status: item.status,
          change_reason: item.change_reason,
          created_at: item.changed_at || item.created_at, // Usar changed_at do banco ou created_at como fallback
          created_by: item.changed_by || item.created_by, // Usar changed_by do banco ou created_by como fallback
        })) as ServiceOrderStatusHistory[];
        
        setStatusHistory(history.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));

        setServiceOrder(orderData as ServiceOrderDetailWithRelations);
      }
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

  const handleTogglePublicAccess = async (enabled: boolean) => {
    if (!serviceOrder) return;
    
    setIsUpdatingAccess(true);
    try {
      const { error } = await supabase
        .from("service_orders")
        .update({ public_access_enabled: enabled })
        .eq("id", serviceOrder.id);

      if (error) throw error;

      setServiceOrder({
        ...serviceOrder,
        public_access_enabled: enabled,
      });

      toast({
        title: enabled ? "Acesso público ativado" : "Acesso público desativado",
        description: enabled 
          ? "O cliente pode acompanhar a ordem de serviço através do QR Code."
          : "O acesso público foi desabilitado.",
      });
    } catch (error: any) {
      console.error("Error updating public access:", error);
      toast({
        title: "Erro ao atualizar acesso público",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAccess(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return SERVICE_ORDER_STATUS_MAP[status as keyof typeof SERVICE_ORDER_STATUS_MAP] || 
           { label: status, variant: "secondary" as const };
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
      <div className="text-center py-8">
        <p className="text-muted-foreground">Ordem de serviço não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/service-orders")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(serviceOrder.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/service-orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Ordem de Serviço #{serviceOrder.order_number}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
              <span className="text-muted-foreground">
                Criada em {new Date(serviceOrder.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/service-orders/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium">{serviceOrder.customers?.name}</p>
                <p className="text-sm text-muted-foreground">{serviceOrder.customers?.email}</p>
                <p className="text-sm text-muted-foreground">{serviceOrder.customers?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações do Veículo */}
        <Card>
          <CardHeader>
            <CardTitle>Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium">
                  {serviceOrder.vehicles?.make} {serviceOrder.vehicles?.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ano: {serviceOrder.vehicles?.year}
                </p>
                <p className="text-sm text-muted-foreground">
                  Placa: {serviceOrder.vehicles?.license_plate}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cor: {serviceOrder.vehicles?.color}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <QRCodeGenerator
          serviceOrderId={serviceOrder.id}
          qrCodeToken={serviceOrder.qr_code_token || ''}
          publicAccessEnabled={serviceOrder.public_access_enabled || false}
          onTogglePublicAccess={handleTogglePublicAccess}
        />
      </div>

      {/* Descrição do Problema */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição do Problema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {serviceOrder.description || "Nenhuma descrição fornecida."}
          </p>
        </CardContent>
      </Card>

      {/* Notas Técnicas */}
      {serviceOrder.technician_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {serviceOrder.technician_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Itens de Serviço */}
      <Card>
        <CardHeader>
          <CardTitle>Itens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceOrder.service_items && serviceOrder.service_items.length > 0 ? (
            <div className="space-y-4">
              {serviceOrder.service_items.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.item_type === 'service' ? 'Serviço' : 'Produto'} • 
                      Quantidade: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {item.total_price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {item.unit_price.toFixed(2)} /un
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span>R$ {serviceOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum item de serviço adicionado.</p>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusHistoryTimeline history={statusHistory} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceOrderDetail;
