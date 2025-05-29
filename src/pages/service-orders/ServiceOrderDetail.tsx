import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Car, Calendar, User, FileText, Clock, Printer, Edit, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ServiceOrderWithRelations, ServiceItem } from "@/types/supabase";
import { QRCodeGenerator } from "@/components/service-orders/QRCodeGenerator";
import { StatusHistoryTimeline } from "@/components/service-orders/StatusHistoryTimeline";

// Status mapping for colors and labels
const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Aprovado", color: "bg-blue-500", icon: FileText },
  in_progress: { label: "Em Andamento", color: "bg-indigo-500", icon: Clock },
  waiting_parts: { label: "Aguardando Peças", color: "bg-purple-500", icon: Clock },
  completed: { label: "Concluído", color: "bg-green-500", icon: Clock },
  canceled: { label: "Cancelado", color: "bg-red-500", icon: AlertTriangle },
};

// Status flow - which status can transition to which
const statusFlow = {
  pending: ["approved", "canceled"],
  approved: ["in_progress", "canceled"],
  in_progress: ["waiting_parts", "completed"],
  waiting_parts: ["in_progress"],
  completed: [], // final state
  canceled: [], // final state
};

interface StatusHistoryItem {
  id: string;
  status: string;
  created_at: string;
  change_reason?: string;
  users?: {
    full_name: string;
  };
}

const ServiceOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceOrder, setServiceOrder] = useState<ServiceOrderWithRelations | null>(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusChangeReason, setStatusChangeReason] = useState("");

  useEffect(() => {
    if (id) {
      loadServiceOrder();
      loadServiceItems();
      loadStatusHistory();
    }
  }, [id]);

  const loadServiceOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          customers (
            id,
            name,
            phone,
            email
          ),
          vehicles (
            id,
            make,
            model,
            year,
            license_plate,
            color
          )
        `)
        .eq("id", id)
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
      navigate("/service-orders");
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceItems = async () => {
    try {
      const { data, error } = await supabase
        .from("service_items")
        .select("*")
        .eq("service_order_id", id)
        .order("created_at");

      if (error) throw error;
      setServiceItems(data || []);
    } catch (error: any) {
      console.error("Error loading service items:", error);
      toast({
        title: "Erro ao carregar itens da ordem",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("service_order_status_history")
        .select(`
          *,
          users:changed_by(full_name)
        `)
        .eq("service_order_id", id)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      setStatusHistory(data || []);
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

  const handleChangeStatus = async () => {
    if (!newStatus) {
      toast({
        title: "Status obrigatório",
        description: "Selecione um novo status para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update service order status
      const { error: updateError } = await supabase
        .from("service_orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;

      // Add status history record
      const { data: userData } = await supabase.auth.getUser();
      const { error: historyError } = await supabase
        .from("service_order_status_history")
        .insert([
          {
            service_order_id: id,
            status: newStatus,
            changed_by: userData.user?.id,
            change_reason: statusChangeReason || null,
          },
        ]);

      if (historyError) throw historyError;

      toast({
        title: "Status atualizado",
        description: `Status alterado para ${statusMap[newStatus as keyof typeof statusMap]?.label}.`,
      });

      // Reload data
      loadServiceOrder();
      loadStatusHistory();
      setIsChangeStatusDialogOpen(false);
      setNewStatus("");
      setStatusChangeReason("");
    } catch (error: any) {
      console.error("Error changing status:", error);
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
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
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Ordem de serviço não encontrada</h2>
        <p className="mt-2 text-muted-foreground">
          A ordem de serviço que você está procurando não existe ou foi removida.
        </p>
        <Button className="mt-4" onClick={() => navigate("/service-orders")}>
          Voltar para a lista
        </Button>
      </div>
    );
  }

  // Get available next statuses based on current status
  const availableStatuses = statusFlow[serviceOrder.status as keyof typeof statusFlow] || [];

  return (
    <div className="space-y-6 print:m-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/service-orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Ordem de Serviço #{serviceOrder.order_number}
            </h1>
            <p className="text-muted-foreground">
              {serviceOrder.created_at && format(new Date(serviceOrder.created_at), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/service-orders/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          {availableStatuses.length > 0 && (
            <Button onClick={() => setIsChangeStatusDialogOpen(true)}>
              Alterar Status
            </Button>
          )}
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Ordem de Serviço #{serviceOrder.order_number}
            </h1>
            <p className="text-sm">
              {serviceOrder.created_at && format(new Date(serviceOrder.created_at), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
          <div className="text-right">
            <h2 className="font-bold">Auto Shop Management System</h2>
            <p className="text-sm">Sua Oficina Mecânica</p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center">
        <Badge 
          className={`${statusMap[serviceOrder.status as keyof typeof statusMap]?.color} text-white px-3 py-1`}
        >
          {statusMap[serviceOrder.status as keyof typeof statusMap]?.label || serviceOrder.status}
        </Badge>
        {serviceOrder.estimated_completion_date && (
          <div className="ml-4 flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            Previsão de conclusão: {format(new Date(serviceOrder.estimated_completion_date), "dd/MM/yyyy")}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer and Vehicle */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente e Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceOrder.customers && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Cliente
                  </h3>
                  <p className="font-medium">
                    <Link 
                      to={`/clients/${serviceOrder.customer_id}`}
                      className="text-primary hover:underline print:no-underline print:text-black"
                    >
                      {serviceOrder.customers.name}
                    </Link>
                  </p>
                  {serviceOrder.customers.phone && (
                    <p className="text-sm">{serviceOrder.customers.phone}</p>
                  )}
                  {serviceOrder.customers.email && (
                    <p className="text-sm">{serviceOrder.customers.email}</p>
                  )}
                </div>
              )}

              {serviceOrder.vehicles && (
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="text-sm font-medium flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    Veículo
                  </h3>
                  <p className="font-medium">
                    <Link 
                      to={`/vehicles/${serviceOrder.vehicle_id}`}
                      className="text-primary hover:underline print:no-underline print:text-black"
                    >
                      {serviceOrder.vehicles.make} {serviceOrder.vehicles.model} ({serviceOrder.vehicles.year})
                    </Link>
                  </p>
                  {serviceOrder.vehicles.license_plate && (
                    <p className="text-sm">Placa: {serviceOrder.vehicles.license_plate}</p>
                  )}
                  {serviceOrder.vehicles.color && (
                    <p className="text-sm">Cor: {serviceOrder.vehicles.color}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {serviceOrder.description}
              </div>
              {serviceOrder.technician_notes && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Notas Técnicas</h3>
                  <div className="whitespace-pre-line text-sm">
                    {serviceOrder.technician_notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for Items and History */}
          <Tabs defaultValue="items" className="print:hidden">
            <TabsList>
              <TabsTrigger value="items">Produtos e Serviços</TabsTrigger>
              <TabsTrigger value="history">Histórico de Status</TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos e Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum item adicionado a esta ordem de serviço.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {serviceItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {item.item_type === "product" ? "Produto" : "Serviço"}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(item.unit_price))}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(item.total_price))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(serviceOrder.total_amount) || 0)}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <StatusHistoryTimeline history={statusHistory} />
            </TabsContent>
          </Tabs>
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

      {/* Print version of items */}
      <div className="hidden print:block mt-6">
        <h2 className="text-xl font-bold mb-4">Produtos e Serviços</h2>
        {serviceItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum item adicionado a esta ordem de serviço.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Tipo</th>
                <th className="text-left py-2">Descrição</th>
                <th className="text-right py-2">Qtd</th>
                <th className="text-right py-2">Preço Unit.</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {serviceItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">
                    {item.item_type === "product" ? "Produto" : "Serviço"}
                  </td>
                  <td className="py-2">{item.description}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(item.unit_price))}
                  </td>
                  <td className="text-right py-2 font-medium">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(item.total_price))}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} className="text-right py-4 font-bold">
                  Valor Total:
                </td>
                <td className="text-right py-4 font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(Number(serviceOrder.total_amount) || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Change Status Dialog */}
      <Dialog open={isChangeStatusDialogOpen} onOpenChange={setIsChangeStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status da Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Selecione o novo status e informe o motivo da alteração.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Atual</label>
              <Badge 
                className={`${statusMap[serviceOrder.status as keyof typeof statusMap]?.color} text-white px-3 py-1`}
              >
                {statusMap[serviceOrder.status as keyof typeof statusMap]?.label || serviceOrder.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Novo Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusMap[status as keyof typeof statusMap]?.label || status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da Alteração</label>
              <Textarea
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="Informe o motivo da alteração de status..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeStatus}>
              Confirmar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceOrderDetail;
