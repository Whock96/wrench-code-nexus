import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PartFormData, PartCategory } from '@/types/inventory-types';
import { useAuth } from '@/contexts/AuthContext';

const partFormSchema = z.object({
  sku: z.string().min(1, 'SKU é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  manufacturer: z.string().optional(),
  compatible_models: z.string().optional(),
  cost_price: z.number().min(0, 'Preço de custo deve ser maior ou igual a 0'),
  selling_price: z.number().min(0, 'Preço de venda deve ser maior ou igual a 0'),
  current_stock: z.number().min(0, 'Estoque atual deve ser maior ou igual a 0'),
  minimum_stock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
  location: z.string().optional(),
  barcode: z.string().optional(),
});

const PartForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const { user } = useAuth();

  const form = useForm<PartFormData>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      description: '',
      category_id: '',
      manufacturer: '',
      compatible_models: '',
      cost_price: 0,
      selling_price: 0,
      current_stock: 0,
      minimum_stock: 1,
      location: '',
      barcode: '',
    },
  });

  useEffect(() => {
    const getShopId = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('shop_users')
        .select('shop_id')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error getting shop ID:', error);
        return;
      }
      
      setShopId(data.shop_id);
    };

    getShopId();
    loadCategories();
    if (isEdit && id) {
      loadPart(id);
    }
  }, [id, isEdit, user]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('part_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPart = async (partId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('id', partId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          sku: data.sku,
          name: data.name,
          description: data.description || '',
          category_id: data.category_id || '',
          manufacturer: data.manufacturer || '',
          compatible_models: data.compatible_models || '',
          cost_price: data.cost_price,
          selling_price: data.selling_price,
          current_stock: data.current_stock,
          minimum_stock: data.minimum_stock,
          location: data.location || '',
          barcode: data.barcode || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading part:', error);
      toast({
        title: 'Erro ao carregar peça',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PartFormData) => {
    if (!shopId) {
      toast({
        title: 'Erro',
        description: 'Não foi possível identificar a oficina',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Add shop_id to the data
      const partData = {
        ...data,
        shop_id: shopId,
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from('parts')
          .update(partData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Peça atualizada',
          description: 'A peça foi atualizada com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('parts')
          .insert([partData]);

        if (error) throw error;

        toast({
          title: 'Peça criada',
          description: 'A nova peça foi criada com sucesso.',
        });
      }

      navigate('/inventory/parts');
    } catch (error: any) {
      console.error('Error saving part:', error);
      toast({
        title: 'Erro ao salvar peça',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/inventory/parts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Editar Peça' : 'Nova Peça'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Edite as informações da peça' : 'Cadastre uma nova peça no estoque'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o SKU da peça" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da peça" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite uma descrição detalhada da peça"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fabricante</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o fabricante" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="compatible_models"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelos Compatíveis</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Civic 2010-2015, Corolla 2012-2018" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preços e Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Custo *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selling_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="current_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Atual *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Prateleira A1, Setor B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Barras</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o código de barras" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/inventory/parts')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PartForm;
