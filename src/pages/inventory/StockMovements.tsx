import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, TrendingUp, TrendingDown, RotateCcw, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StockMovement, Part, StockMovementFormData } from '@/types/inventory-types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

const movementFormSchema = z.object({
  part_id: z.string().min(1, 'Peça é obrigatória'),
  movement_type: z.enum(['entry', 'exit', 'adjustment', 'return']),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
  unit_price: z.number().min(0).optional(),
  notes: z.string().optional(),
});

interface PartWithStock {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  shop_id: string;
  cost_price: number;
  selling_price: number;
  minimum_stock: number;
  created_at: string;
}

const StockMovements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [parts, setParts] = useState<PartWithStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [shopId, setShopId] = useState<string | null>(null);
  const { user } = useAuth();

  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      part_id: '',
      movement_type: 'entry',
      quantity: 1,
      unit_price: 0,
      notes: '',
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
  }, [user]);

  useEffect(() => {
    if (shopId) {
      loadMovements();
      loadParts();
    }
  }, [shopId]);

  const loadMovements = async () => {
    if (!shopId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          parts (
            id,
            name,
            sku
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to match our interfaces
      const formattedMovements: StockMovement[] = (data || []).map((item: any) => ({
        id: item.id,
        part_id: item.part_id,
        movement_type: item.movement_type as 'entry' | 'exit' | 'adjustment' | 'return',
        quantity: item.quantity,
        previous_stock: item.previous_stock,
        new_stock: item.new_stock,
        unit_price: item.unit_price,
        total_price: item.total_price,
        reference_type: item.reference_type,
        reference_id: item.reference_id,
        notes: item.notes,
        created_by: item.created_by,
        created_at: item.created_at,
      }));
      
      setMovements(formattedMovements);
    } catch (error: any) {
      console.error('Error loading movements:', error);
      toast({
        title: 'Erro ao carregar movimentações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadParts = async () => {
    if (!shopId) return;
    
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('id, name, sku, current_stock, shop_id, cost_price, selling_price, minimum_stock, created_at')
        .eq('shop_id', shopId)
        .order('name');

      if (error) throw error;
      
      // Cast the data to match our interface
      const formattedParts: PartWithStock[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        current_stock: item.current_stock,
        shop_id: item.shop_id,
        cost_price: item.cost_price,
        selling_price: item.selling_price,
        minimum_stock: item.minimum_stock,
        created_at: item.created_at,
      }));
      
      setParts(formattedParts);
    } catch (error: any) {
      console.error('Error loading parts:', error);
    }
  };

  const onSubmit = async (data: StockMovementFormData) => {
    if (!shopId) return;
    
    try {
      // Buscar o estoque atual da peça
      const part = parts.find(p => p.id === data.part_id);
      if (!part) {
        toast({
          title: 'Erro',
          description: 'Peça não encontrada',
          variant: 'destructive',
        });
        return;
      }

      const currentStock = part.current_stock;
      let newStock = currentStock;

      // Calcular novo estoque baseado no tipo de movimentação
      switch (data.movement_type) {
        case 'entry':
          newStock = currentStock + data.quantity;
          break;
        case 'exit':
          newStock = Math.max(0, currentStock - data.quantity);
          break;
        case 'adjustment':
          newStock = data.quantity;
          break;
        case 'return':
          newStock = currentStock + data.quantity;
          break;
      }

      // Criar a movimentação
      const movementData = {
        part_id: data.part_id,
        movement_type: data.movement_type,
        quantity: data.quantity,
        previous_stock: currentStock,
        new_stock: newStock,
        unit_price: data.unit_price,
        total_price: data.unit_price ? data.unit_price * data.quantity : null,
        notes: data.notes,
        created_by: user?.id,
      };

      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([movementData]);

      if (movementError) throw movementError;

      // Atualizar o estoque da peça
      const { error: updateError } = await supabase
        .from('parts')
        .update({ current_stock: newStock })
        .eq('id', data.part_id);

      if (updateError) throw updateError;

      toast({
        title: 'Movimentação registrada',
        description: 'A movimentação foi registrada com sucesso.',
      });

      setIsDialogOpen(false);
      form.reset();
      loadMovements();
      loadParts();
    } catch (error: any) {
      console.error('Error creating movement:', error);
      toast({
        title: 'Erro ao registrar movimentação',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'exit':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const labels = {
      entry: 'Entrada',
      exit: 'Saída',
      adjustment: 'Ajuste',
      return: 'Devolução',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch = 
      (movement as any).parts?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement as any).parts?.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === '' || movement.movement_type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movimentações de Estoque</h1>
          <p className="text-muted-foreground">Registre entradas, saídas e ajustes de estoque</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Movimentação</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="part_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peça *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma peça" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parts.map((part) => (
                            <SelectItem key={part.id} value={part.id}>
                              {part.name} (SKU: {part.sku}) - Estoque: {part.current_stock}
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
                  name="movement_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movimentação *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entry">Entrada</SelectItem>
                          <SelectItem value="exit">Saída</SelectItem>
                          <SelectItem value="adjustment">Ajuste</SelectItem>
                          <SelectItem value="return">Devolução</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade *</FormLabel>
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

                <FormField
                  control={form.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Unitário</FormLabel>
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione observações sobre esta movimentação"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Registrar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por peça..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="entry">Entrada</SelectItem>
                <SelectItem value="exit">Saída</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
                <SelectItem value="return">Devolução</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>
            Movimentações ({filteredMovements.length} {filteredMovements.length === 1 ? 'item' : 'itens'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peça</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Estoque Anterior</TableHead>
                  <TableHead>Novo Estoque</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhuma movimentação encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{(movement as any).parts?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {(movement as any).parts?.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.movement_type)}
                          <span>{getMovementTypeLabel(movement.movement_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={movement.movement_type === 'entry' ? 'default' : 'destructive'}>
                          {movement.movement_type === 'entry' ? '+' : '-'}{movement.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.previous_stock}</TableCell>
                      <TableCell>{movement.new_stock}</TableCell>
                      <TableCell>
                        {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{movement.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovements;
