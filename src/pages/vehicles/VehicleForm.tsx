
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCountries } from '@/hooks/useCountries';
import { useShop } from '@/hooks/useShop';

const VehicleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { shopId } = useShop();
  const { countries, isLoading: isLoadingCountries, getVehicleRegistrationLabel } = useCountries();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: "",
    vin: "",
    country_code: "BR",
    registration_type: "license_plate",
    mileage: "",
    color: "",
    fuel_type: "",
    engine_type: "",
    notes: "",
  });

  useEffect(() => {
    loadCustomers();
    if (isEditing && id) {
      loadVehicle();
    }
  }, [id, isEditing]);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .eq('shop_id', shopId)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error loading customers:', error);
    }
  };

  const loadVehicle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        customer_id: data.customer_id || "",
        make: data.make,
        model: data.model,
        year: data.year || new Date().getFullYear(),
        license_plate: data.license_plate || "",
        vin: data.vin || "",
        country_code: data.country_code || "BR",
        registration_type: data.registration_type || "license_plate",
        mileage: data.mileage?.toString() || "",
        color: data.color || "",
        fuel_type: data.fuel_type || "",
        engine_type: data.engine_type || "",
        notes: data.notes || "",
      });
    } catch (error: any) {
      console.error('Error loading vehicle:', error);
      toast({
        title: 'Erro ao carregar veículo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;

    try {
      setIsSaving(true);

      const vehicleData = {
        ...formData,
        year: Number(formData.year),
        mileage: formData.mileage ? Number(formData.mileage) : null,
        shop_id: shopId,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Veículo atualizado',
          description: 'As informações do veículo foram atualizadas com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert(vehicleData);

        if (error) throw error;

        toast({
          title: 'Veículo criado',
          description: 'O veículo foi criado com sucesso.',
        });
      }

      navigate('/vehicles');
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Erro ao salvar veículo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingCountries) {
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do veículo' : 'Cadastre um novo veículo'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Cliente *</Label>
              <Select 
                value={formData.customer_id} 
                onValueChange={(value) => handleInputChange("customer_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
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
                  onChange={(e) => handleInputChange("year", Number(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="country_code">País do Registro</Label>
                <Select 
                  value={formData.country_code} 
                  onValueChange={(value) => handleInputChange("country_code", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">{getVehicleRegistrationLabel(formData.country_code)}</Label>
                <Input 
                  id="license_plate" 
                  value={formData.license_plate}
                  onChange={(e) => handleInputChange("license_plate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN/Chassi</Label>
                <Input 
                  id="vin" 
                  value={formData.vin}
                  onChange={(e) => handleInputChange("vin", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="mileage">Quilometragem</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange("mileage", e.target.value)}
                  min="0"
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
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Combustível</Label>
                <Select 
                  value={formData.fuel_type} 
                  onValueChange={(value) => handleInputChange("fuel_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Etanol">Etanol</SelectItem>
                    <SelectItem value="Flex">Flex</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="GNV">GNV</SelectItem>
                    <SelectItem value="Elétrico">Elétrico</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="engine_type">Tipo do Motor</Label>
                <Input
                  id="engine_type"
                  value={formData.engine_type}
                  onChange={(e) => handleInputChange("engine_type", e.target.value)}
                  placeholder="Ex: 1.0, 2.0, V6"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionais</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Observações sobre o veículo..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Veículo' : 'Criar Veículo'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
};

export default VehicleForm;
