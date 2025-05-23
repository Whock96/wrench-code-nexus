
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CustomerSelect, VehicleSelect, ServiceItem } from "@/types/supabase";

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "waiting_parts", label: "Aguardando Peças" },
  { value: "completed", label: "Concluído" },
  { value: "canceled", label: "Cancelado" },
];

const ServiceOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    customer_id: searchParams.get("customer") || "",
    vehicle_id: "",
    description: "",
    technician_notes: "",
    estimated_completion_date: "",
    status: "pending",
  });
  
  const [customers, setCustomers] = useState<CustomerSelect[]>([]);
  const [vehicles, setVehicles] = useState<VehicleSelect[]>([]);
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  useEffect(() => {
    loadCustomers();
    if (isEditing) {
      loadServiceOrder();
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (formData.customer_id) {
      loadVehicles(formData.customer_id);
    } else {
      setVehicles([]);
      setFormData(prev => ({ ...prev, vehicle_id: "" }));
    }
  }, [formData.customer_id]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");
        
      if (error) throw error;
      setCustomers((data || []) as CustomerSelect[]);
    } catch (error: any) {
      console.error("Error loading customers:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadVehicles = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, license_plate")
        .eq("customer_id", customerId)
        .order("make");
        
      if (error) throw error;
      setVehicles((data || []) as VehicleSelect[]);
    } catch (error: any) {
      console.error("Error loading vehicles:", error);
      toast({
        title: "Erro ao carregar veículos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadServiceOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from("service_orders")
        .select("*")
        .eq("id", id)
        .single();
        
      if (orderError) throw orderError;
      
      if (orderData) {
        setFormData({
          customer_id: orderData.customer_id,
          vehicle_id: orderData.vehicle_id,
          description: orderData.description || "",
          technician_notes: orderData.technician_notes || "",
          estimated_completion_date: orderData.estimated_completion_date || "",
          status: orderData.status,
        });

        // Load service items
        const { data: itemsData, error: itemsError } = await supabase
          .from("service_items")
          .select("*")
          .eq("service_order_id", id);
          
        if (itemsError) throw itemsError;
        
        setItems(itemsData?.map(item => ({
          id: item.id,
          item_type: item.item_type,
          description: item.description,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          total_price: Number(item.total_price),
        })) || []);
      }
    } catch (error: any) {
      console.error("Error loading service order:", error);
      toast({
        title: "Erro ao carregar ordem de serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const addItem = () => {
    setItems([...items, {
      item_type: "service",
      description: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ServiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total_price when quantity or unit_price changes
    if (field === "quantity" || field === "unit_price") {
      updatedItems[index].total_price = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setItems(updatedItems);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + item.total_price, 0);
  };

  const validateForm = () => {
    if (!formData.customer_id) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para continuar.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.vehicle_id) {
      toast({
        title: "Veículo obrigatório",
        description: "Selecione um veículo para continuar.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.description) {
      toast({
        title: "Descrição obrigatória",
        description: "Informe a descrição do problema para continuar.",
        variant: "destructive",
      });
      return false;
    }
    
    if (items.length === 0) {
      toast({
        title: "Itens obrigatórios",
        description: "Adicione pelo menos um produto ou serviço.",
        variant: "destructive",
      });
      return false;
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description.trim()) {
        toast({
          title: "Descrição do item obrigatória",
          description: `O item ${i + 1} precisa de uma descrição.`,
          variant: "destructive",
        });
        return false;
      }
      if (item.quantity <= 0) {
        toast({
          title: "Quantidade inválida",
          description: `O item ${i + 1} precisa de uma quantidade maior que zero.`,
          variant: "destructive",
        });
        return false;
      }
      if (item.unit_price <= 0) {
        toast({
          title: "Preço inválido",
          description: `O item ${i + 1} precisa de um preço maior que zero.`,
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For now, we'll use a mock shop_id. In a real app, this would come from the user's context
      const mockShopId = "00000000-0000-0000-0000-000000000001";
      
      const orderData = {
        shop_id: mockShopId,
        customer_id: formData.customer_id,
        vehicle_id: formData.vehicle_id,
        description: formData.description || null,
        technician_notes: formData.technician_notes || null,
        estimated_completion_date: formData.estimated_completion_date || null,
        status: formData.status,
      };
      
      let serviceOrderId: string;
      
      if (isEditing) {
        const { error } = await supabase
          .from("service_orders")
          .update(orderData)
          .eq("id", id);
          
        if (error) throw error;
        serviceOrderId = id!;
        
        // Delete existing items
        const { error: deleteError } = await supabase
          .from("service_items")
          .delete()
          .eq("service_order_id", id);
          
        if (deleteError) throw deleteError;
      } else {
        const { data, error } = await supabase
          .from("service_orders")
          .insert([orderData])
          .select()
          .single();
          
        if (error) throw error;
        serviceOrderId = data.id;

        // Add initial status history
        const { error: historyError } = await supabase
          .from("service_order_status_history")
          .insert([{
            service_order_id: serviceOrderId,
            status: formData.status,
            change_reason: "Ordem de serviço criada",
          }]);
          
        if (historyError) console.error("Error adding status history:", historyError);
      }
      
      // Insert items
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          service_order_id: serviceOrderId,
          item_type: item.item_type,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));
        
        const { error: itemsError } = await supabase
          .from("service_items")
          .insert(itemsToInsert);
          
        if (itemsError) throw itemsError;
      }
      
      toast({
        title: isEditing ? "Ordem de serviço atualizada!" : "Ordem de serviço criada!",
        description: isEditing ? "A ordem de serviço foi atualizada com sucesso." : "A nova ordem de serviço foi criada com sucesso.",
      });
      
      navigate("/service-orders");
    } catch (error: any) {
      console.error("Error saving service order:", error);
      toast({
        title: isEditing ? "Erro ao atualizar ordem de serviço" : "Erro ao criar ordem de serviço",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/service-orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Atualize os dados da ordem de serviço" : "Crie uma nova ordem de serviço"}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cliente e Veículo */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente e Veículo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Cliente *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicle_id">Veículo *</Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_id: value }))}
                    required
                    disabled={!formData.customer_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} {vehicle.license_plate && `- ${vehicle.license_plate}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações da OS */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Ordem de Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Problema *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o problema relatado pelo cliente..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technician_notes">Notas Técnicas</Label>
                <Textarea
                  id="technician_notes"
                  value={formData.technician_notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, technician_notes: e.target.value }))}
                  placeholder="Notas técnicas internas..."
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estimated_completion_date">Data Estimada de Conclusão</Label>
                  <Input
                    id="estimated_completion_date"
                    type="date"
                    value={formData.estimated_completion_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens da OS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Itens da Ordem de Serviço</CardTitle>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={item.item_type}
                        onValueChange={(value) => updateItem(index, "item_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Serviço</SelectItem>
                          <SelectItem value="product">Produto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Preço Unitário</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Total</Label>
                      <Input
                        value={`R$ ${item.total_price.toFixed(2)}`}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      placeholder="Descrição do item..."
                      required
                    />
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                </div>
              )}
              
              {items.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Geral</div>
                      <div className="text-2xl font-bold">R$ {getTotalAmount().toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Atualizar Ordem de Serviço" : "Criar Ordem de Serviço"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default ServiceOrderForm;
