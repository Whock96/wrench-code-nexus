
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
import { Json } from '@/integrations/supabase/types';

interface AddressData {
  street: string;
  number: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

const ClientForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { shopId } = useShop();
  const { countries, isLoading: isLoadingCountries, getDocumentLabel } = useCountries();
  const isEditing = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tax_id: "",
    tax_id_type: "CPF/CNPJ",
    country_code: "BR",
    locale: "pt-BR",
    birth_date: "",
    address: {
      street: "",
      number: "",
      city: "",
      state: "",
      zip_code: "",
      country: "Brasil",
    } as AddressData,
    notes: "",
  });

  // Helper functions for type conversion
  const addressToJson = (address: AddressData): Json => {
    return address as unknown as Json;
  };

  const jsonToAddress = (json: Json | null): AddressData => {
    if (!json) {
      return {
        street: "",
        number: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Brasil",
      };
    }
    
    // If it's an object, try to extract the fields
    if (typeof json === 'object' && json !== null) {
      const obj = json as Record<string, any>;
      return {
        street: obj.street || "",
        number: obj.number || "",
        city: obj.city || "",
        state: obj.state || "",
        zip_code: obj.zip_code || "",
        country: obj.country || "Brasil",
      };
    }
    
    // Fallback to empty object
    return {
      street: "",
      number: "",
      city: "",
      state: "",
      zip_code: "",
      country: "Brasil",
    };
  };

  useEffect(() => {
    if (isEditing && id) {
      loadClient();
    }
  }, [id, isEditing]);

  const loadClient = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        tax_id: data.tax_id || "",
        tax_id_type: data.tax_id_type || "CPF/CNPJ",
        country_code: data.country_code || "BR",
        locale: data.locale || "pt-BR",
        birth_date: data.birth_date || "",
        address: jsonToAddress(data.address),
        notes: data.notes || "",
      });
    } catch (error: any) {
      console.error('Error loading client:', error);
      toast({
        title: 'Erro ao carregar cliente',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) return;

    try {
      setIsSaving(true);

      const clientData = {
        ...formData,
        address: addressToJson(formData.address),
        shop_id: shopId,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('customers')
          .update(clientData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Cliente atualizado',
          description: 'As informações do cliente foram atualizadas com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('customers')
          .insert(clientData);

        if (error) throw error;

        toast({
          title: 'Cliente criado',
          description: 'O cliente foi criado com sucesso.',
        });
      }

      navigate('/clients');
    } catch (error: any) {
      console.error('Error saving client:', error);
      toast({
        title: 'Erro ao salvar cliente',
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
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange("birth_date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="country_code">País</Label>
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
                <Label htmlFor="tax_id_type">Tipo de Documento</Label>
                <Input 
                  id="tax_id_type" 
                  value={formData.tax_id_type}
                  onChange={(e) => handleInputChange("tax_id_type", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">{getDocumentLabel(formData.country_code)}</Label>
                <Input 
                  id="tax_id" 
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange("tax_id", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange("address.street", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.address.number}
                  onChange={(e) => handleInputChange("address.number", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={formData.address.zip_code}
                  onChange={(e) => handleInputChange("address.zip_code", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange("address.city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange("address.state", e.target.value)}
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
                placeholder="Observações sobre o cliente..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/clients')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Cliente' : 'Criar Cliente'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
};

export default ClientForm;
