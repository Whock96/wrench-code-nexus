
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Car, FileText, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Status mapping for colors and labels
const statusMap = {
  pending: { label: "Pendente", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Aprovado", color: "bg-blue-500", icon: Clock },
  in_progress: { label: "Em Andamento", color: "bg-indigo-500", icon: Clock },
  waiting_parts: { label: "Aguardando Peças", color: "bg-purple-500", icon: Clock },
  completed: { label: "Concluído", color: "bg-green-500", icon: CheckCircle },
  canceled: { label: "Cancelado", color: "bg-red-500", icon: AlertTriangle },
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    vehicles: 0,
    serviceOrders: 0,
    revenue: 0,
  });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load client count
      const { count: clientCount, error: clientError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      
      if (clientError) throw clientError;
      
      // Load vehicle count
      const { count: vehicleCount, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true });
      
      if (vehicleError) throw vehicleError;
      
      // Load service order count
      const { count: serviceOrderCount, error: serviceOrderError } = await supabase
        .from("service_orders")
        .select("*", { count: "exact", head: true });
      
      if (serviceOrderError) throw serviceOrderError;
      
      // Load total revenue (sum of total_amount from completed orders)
      const { data: revenueData, error: revenueError } = await supabase
        .from("service_orders")
        .select("total_amount")
        .eq("status", "completed");
      
      if (revenueError) throw revenueError;
      
      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      // Load status counts
      const { data: statusData, error: statusError } = await supabase
        .from("service_orders")
        .select("status");
      
      if (statusError) throw statusError;
      
      const counts: Record<string, number> = {};
      statusData?.forEach(order => {
        counts[order.status] = (counts[order.status] || 0) + 1;
      });
      
      // Load recent orders
      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from("service_orders")
        .select(`
          *,
          customers:customer_id(name),
          vehicles:vehicle_id(make, model, license_plate)
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (recentOrdersError) throw recentOrdersError;
      
      setStats({
        clients: clientCount || 0,
        vehicles: vehicleCount || 0,
        serviceOrders: serviceOrderCount || 0,
        revenue: totalRevenue,
      });
      
      setStatusCounts(counts);
      setRecentOrders(recentOrdersData || []);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {user?.firstName || user?.full_name || 'Usuário'}! Aqui está o que está acontecendo hoje.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => loadDashboardData()}>Atualizar</Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.clients}</div>
              <p className="text-xs text-muted-foreground">
                Clientes cadastrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.vehicles}</div>
              <p className="text-xs text-muted-foreground">
                Veículos cadastrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats.serviceOrders}</div>
              <p className="text-xs text-muted-foreground">
                Ordens de serviço totais
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading
                  ? "..."
                  : new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(stats.revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                De ordens concluídas
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(statusMap).map(([status, { label, color, icon: Icon }]) => (
                <Card key={status}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                    <div className={`${color} p-1 rounded-full`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : statusCounts[status] || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ordens de serviço
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Recent Orders */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Ordens de Serviço Recentes</CardTitle>
                <CardDescription>
                  As 5 ordens de serviço mais recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">
                      Nenhuma ordem de serviço encontrada
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const statusInfo = statusMap[order.status as keyof typeof statusMap];
                      const Icon = statusInfo?.icon || Clock;
                      
                      return (
                        <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                          <div className="flex items-center space-x-4">
                            <div className={`${statusInfo?.color} p-2 rounded-full`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <Link 
                                to={`/service-orders/${order.id}`}
                                className="font-medium hover:underline"
                              >
                                OS #{order.order_number}
                              </Link>
                              <div className="text-sm text-muted-foreground">
                                {order.customers?.name} - {order.vehicles?.make} {order.vehicles?.model}
                                {order.vehicles?.license_plate && ` (${order.vehicles.license_plate})`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(order.total_amount || 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="text-center pt-4">
                      <Button asChild variant="outline">
                        <Link to="/service-orders">Ver Todas as Ordens</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status</CardTitle>
                <CardDescription>
                  Visão geral do status das ordens de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statusMap).map(([status, { label, color }]) => {
                    const count = statusCounts[status] || 0;
                    const percentage = stats.serviceOrders > 0 
                      ? Math.round((count / stats.serviceOrders) * 100) 
                      : 0;
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <div 
                            className={`h-2 rounded-full ${color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild className="w-full">
                    <Link to="/service-orders/new">
                      <FileText className="h-4 w-4 mr-2" />
                      Nova Ordem de Serviço
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/service-orders">
                      <FileText className="h-4 w-4 mr-2" />
                      Listar Ordens
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/clients/new">
                      <Users className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/vehicles/new">
                      <Car className="h-4 w-4 mr-2" />
                      Novo Veículo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
