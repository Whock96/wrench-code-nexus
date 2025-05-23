
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const VehicleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    license_plate: "",
    vin: "",
    color: "",
    engine_type: "",
    fuel_type: "",
    mileage: "",
    customer_id: "",
    notes: "",
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  useEffect(() => {
    loadCustomers();
    if (isEditing) {
      loadVehicle();
    }
  }, [id, isEditing]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error("Error loading customers:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          make: data.make || "",
          model: data.model || "",
          year: data.year?.toString() || "",
          license_plate: data.license_plate || "",
          vin: data.vin || "",
          color: data.color || "",
          engine_type: data.engine_type || "",
          fuel_type: data.fuel_type || "",
          mileage: data.mileage?.toString() || "",
          customer_id: data.customer_id || "",
          notes: data.notes || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading vehicle:", error);
      toast({
        title: "Erro ao carregar veículo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, we'll use a mock shop_id. In a real app, this would come from the user's context
      const mockShopId = "00000000-0000-0000-0000-000000000001";

      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : null,
        license_plate: formData.license_plate || null,
        vin: formData.vin || null,
        color: formData.color || null,
        engine_type: formData.engine_type || null,
        fuel_type: formData.fuel_type || null,
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        customer_id: formData.customer_id,
        notes: formData.notes || null,
        shop_id: mockShopId,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("vehicles")
          .update(vehicleData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Veículo atualizado!",
          description: "Os dados do veículo foram atualizados com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("vehicles")
          .insert([vehicleData]);

        if (error) throw error;

        toast({
          title: "Veículo cadastrado!",
          description: "O novo veículo foi cadastrado com sucesso.",
        });
      }

      navigate("/vehicles");
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      toast({
        title: isEditing ? "Erro ao atualizar veículo" : "Erro ao cadastrar veículo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
          <Button variant="ghost" onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Veículo" : "Novo Veículo"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Atualize os dados do veículo" : "Cadastre um novo veículo"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Cliente *</Label>
                  <Select
                    value={formData.customer_id}
                    onValueChange={(value) => handleInputChange("customer_id", value)}
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
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="make">Marca *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    min="1900"
                    max="2030"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="license_plate">Placa</Label>
                  <Input
                    id="license_plate"
                    value={formData.license_plate}
                    onChange={(e) => handleInputChange("license_plate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">Chassi (VIN)</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="engine_type">Tipo de Motor</Label>
                  <Input
                    id="engine_type"
                    value={formData.engine_type}
                    onChange={(e) => handleInputChange("engine_type", e.target.value)}
                    placeholder="Ex: 2.0 16V"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Combustível</Label>
                  <Select
                    value={formData.fuel_type}
                    onValueChange={(value) => handleInputChange("fuel_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o combustível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasolina</SelectItem>
                      <SelectItem value="ethanol">Etanol</SelectItem>
                      <SelectItem value="flex">Flex</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Elétrico</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Quilometragem</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    min="0"
                    placeholder="Ex: 50000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Observações adicionais sobre o veículo..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => navigate("/vehicles")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Salvar Alterações" : "Cadastrar Veículo"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default VehicleForm;
