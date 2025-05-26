
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Car, Calendar, User, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Status mapping for colors and labels
const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Aprovado", color: "bg-blue-500", icon: Clock },
  in_progress: { label: "Em Andamento", color: "bg-indigo-500", icon: Clock },
  waiting_parts: { label: "Aguardando Peças", color: "bg-purple-500", icon: Clock },
  completed: { label: "Concluído", color: "bg-green-500", icon: Clock },
  canceled: { label: "Cancelado", color: "bg-red-500", icon: Clock },
};

const PublicServiceOrderView: React.FC = () => {
  const { id } = useParams();
  const [serviceOrder, setServiceOrder] = useState<any>(null);
  const [serviceItems, setServiceItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServiceOrder();
  }, [id]);

  const loadServiceOrder = async () => {
    try {
      // For public access, we need to use RLS policies that allow public access
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          customers:customer_id(name),
          vehicles:vehicle_id(make, model, year, license_plate)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError("Ordem de serviço não encontrada");
        setIsLoading(false);
        return;
      }

      setServiceOrder(data);
      loadServiceItems();
    } catch (error: any) {
      console.error("Error loading service order:", error);
      setError("Erro ao carregar ordem de serviço. Verifique o link ou tente novamente mais tarde.");
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
      // We already have the service order, so just log this error
    } finally {
      setIsLoading(false);
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h2 className="text-2xl font-bold">Ordem de serviço não encontrada</h2>
          <p className="text-muted-foreground">
            {error || "A ordem de serviço que você está procurando não existe ou foi removida."}
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a página inicial
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Ordem de Serviço #{serviceOrder.order_number}
            </h1>
            <p className="text-muted-foreground">
              {serviceOrder.created_at && format(new Date(serviceOrder.created_at), "dd/MM/yyyy HH:mm")}
            </p>
            <div className="flex justify-center mt-4">
              <Badge 
                className={`${statusMap[serviceOrder.status as keyof typeof statusMap]?.color} text-white px-3 py-1`}
              >
                {statusMap[serviceOrder.status as keyof typeof statusMap]?.label || serviceOrder.status}
              </Badge>
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer and Vehicle */}
            <Card>
              <CardHeader>
                <CardTitle>Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceOrder.vehicles && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Dados do Veículo
                    </h3>
                    <p className="font-medium">
                      {serviceOrder.vehicles.make} {serviceOrder.vehicles.model} ({serviceOrder.vehicles.year})
                    </p>
                    {serviceOrder.vehicles.license_plate && (
                      <p className="text-sm">Placa: {serviceOrder.vehicles.license_plate}</p>
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
                  {serviceOrder.description}
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
