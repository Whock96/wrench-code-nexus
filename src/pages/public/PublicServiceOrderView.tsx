
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Car, Calendar, User, Clock, DollarSign, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Status mapping for colors and labels
const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500", variant: "secondary" as const },
  approved: { label: "Aprovado", color: "bg-blue-500", variant: "default" as const },
  in_progress: { label: "Em Andamento", color: "bg-indigo-500", variant: "default" as const },
  waiting_parts: { label: "Aguardando Peças", color: "bg-purple-500", variant: "outline" as const },
  completed: { label: "Concluído", color: "bg-green-500", variant: "default" as const },
  canceled: { label: "Cancelado", color: "bg-red-500", variant: "destructive" as const },
};

const PublicServiceOrderView: React.FC = () => {
  const { id } = useParams();
  const [serviceOrder, setServiceOrder] = useState<any>(null);
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadServiceOrder(id);
    }
  }, [id]);

  const loadServiceOrder = async (token: string) => {
    try {
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          customers:customer_id(name),
          vehicles:vehicle_id(make, model, year, license_plate, color)
        `)
        .eq("qr_code_token", token)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError("Ordem de serviço não encontrada");
        setIsLoading(false);
        return;
      }

      if (!data.public_access_enabled) {
        setError("O acesso público a esta ordem de serviço foi desativado");
        setIsLoading(false);
        return;
      }

      setServiceOrder(data);
      loadServiceItems(data.id);
      loadStatusHistory(data.id);
    } catch (error: any) {
      console.error("Error loading service order:", error);
      setError("Não foi possível carregar os detalhes da ordem de serviço");
    } finally {
      setIsLoading(false);
    }
  };

  const loadServiceItems = async (serviceOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from("service_items")
        .select("*")
        .eq("service_order_id", serviceOrderId)
        .order("created_at");

      if (error) throw error;
      setServiceItems(data || []);
    } catch (error: any) {
      console.error("Error loading service items:", error);
    }
  };

  const loadStatusHistory = async (serviceOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from("service_order_status_history")
        .select("status, created_at, change_reason")
        .eq("service_order_id", serviceOrderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStatusHistory(data || []);
    } catch (error: any) {
      console.error("Error loading status history:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !serviceOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error || "Ordem de serviço não encontrada"}</p>
            <Button asChild className="w-full mt-4">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para a página inicial
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = serviceOrder.status as keyof typeof statusMap;
  const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Ordem de Serviço #{serviceOrder.order_number}
            </h1>
            <p className="text-muted-foreground">
              {serviceOrder.created_at && format(new Date(serviceOrder.created_at), "dd/MM/yyyy HH:mm")}
            </p>
            <div className="flex justify-center mt-4">
              <Badge variant={statusInfo.variant} className="text-lg px-4 py-1">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Última atualização: {serviceOrder.last_status_update 
                ? format(new Date(serviceOrder.last_status_update), "dd/MM/yyyy HH:mm")
                : format(new Date(serviceOrder.created_at), "dd/MM/yyyy HH:mm")}
            </p>
          </div>

          {/* Main content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer and Vehicle */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceOrder.customers && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Cliente
                    </h3>
                    <p className="font-medium">{serviceOrder.customers.name}</p>
                  </div>
                )}

                {serviceOrder.vehicles && (
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-sm font-medium flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Veículo
                    </h3>
                    <p className="font-medium">
                      {serviceOrder.vehicles.make} {serviceOrder.vehicles.model} ({serviceOrder.vehicles.year})
                    </p>
                    {serviceOrder.vehicles.license_plate && (
                      <p className="text-sm">Placa: {serviceOrder.vehicles.license_plate}</p>
                    )}
                    {serviceOrder.vehicles.color && (
                      <p className="text-sm">Cor: {serviceOrder.vehicles.color}</p>
                    )}
                  </div>
                )}

                {serviceOrder.estimated_completion_date && (
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Previsão de Conclusão
                    </h3>
                    <p>
                      {format(new Date(serviceOrder.estimated_completion_date), "dd/MM/yyyy")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição do Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {serviceOrder.description || "Sem descrição"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items */}
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
                          }).format(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.total_price)}
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
                  }).format(serviceOrder.total_amount || 0)}
                </p>
              </div>
            </CardFooter>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atualizações</CardTitle>
            </CardHeader>
            <CardContent>
              {statusHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma atualização de status registrada.
                </p>
              ) : (
                <div className="relative pl-8 border-l border-border">
                  {statusHistory.map((item, index) => {
                    const status = item.status as keyof typeof statusMap;
                    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };
                    
                    return (
                      <div key={index} className={`mb-8 last:mb-0 relative`}>
                        <div className="absolute -left-[25px] mt-1.5 h-4 w-4 rounded-full bg-primary border-4 border-background"></div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleString()}
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
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>Esta é uma visualização pública da ordem de serviço.</p>
            <p>Para mais informações, entre em contato com a oficina.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicServiceOrderView;
