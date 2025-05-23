
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, ClipboardList, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";

type ServiceOrder = Tables<"service_orders"> & {
  customers?: {
    id: string;
    name: string;
  } | null;
  vehicles?: {
    id: string;
    make: string;
    model: string;
    license_plate?: string;
  } | null;
};

const statusMap = {
  pending: { label: "Pendente", variant: "secondary" as const },
  approved: { label: "Aprovado", variant: "default" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  waiting_parts: { label: "Aguardando Peças", variant: "outline" as const },
  completed: { label: "Concluído", variant: "default" as const },
  canceled: { label: "Cancelado", variant: "destructive" as const },
};

const ServiceOrderList: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServiceOrders();
  }, []);

  const loadServiceOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("service_orders")
        .select(`
          *,
          customers (
            id,
            name
          ),
          vehicles (
            id,
            make,
            model,
            license_plate
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServiceOrders(data || []);
    } catch (error: any) {
      console.error("Error loading service orders:", error);
      toast({
        title: "Erro ao carregar ordens de serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServiceOrders = serviceOrders.filter(order =>
    order.order_number.toString().includes(searchTerm) ||
    order.customers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.vehicles?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statusMap[order.status as keyof typeof statusMap]?.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
            <p className="text-muted-foreground">
              Gerencie as ordens de serviço da sua oficina
            </p>
          </div>
          <Button asChild>
            <Link to="/service-orders/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem de Serviço
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por número, cliente, placa ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Service Orders Table */}
        {filteredServiceOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma ordem de serviço encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Nenhuma ordem corresponde aos critérios de busca." : "Você ainda não tem ordens de serviço cadastradas."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/service-orders/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Ordem de Serviço
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço ({filteredServiceOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServiceOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.order_number}
                      </TableCell>
                      <TableCell>
                        {order.customers ? (
                          <Link
                            to={`/clients/${order.customers.id}`}
                            className="text-primary hover:underline"
                          >
                            {order.customers.name}
                          </Link>
                        ) : (
                          "Cliente não encontrado"
                        )}
                      </TableCell>
                      <TableCell>
                        {order.vehicles ? (
                          <Link
                            to={`/vehicles/${order.vehicles.id}`}
                            className="text-primary hover:underline"
                          >
                            <div>
                              <div className="font-medium">
                                {order.vehicles.make} {order.vehicles.model}
                              </div>
                              {order.vehicles.license_plate && (
                                <div className="text-sm text-muted-foreground">
                                  {order.vehicles.license_plate}
                                </div>
                              )}
                            </div>
                          </Link>
                        ) : (
                          "Veículo não encontrado"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[order.status as keyof typeof statusMap]?.variant || "secondary"}>
                          {statusMap[order.status as keyof typeof statusMap]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        R$ {Number(order.total_amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/service-orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild size="sm">
                            <Link to={`/service-orders/${order.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ServiceOrderList;
