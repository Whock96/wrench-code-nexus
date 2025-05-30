
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Package, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PartWithRelations, StockMovement } from '@/types/inventory-types';
import { StockIndicator } from '@/components/inventory/StockIndicator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PartDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [part, setPart] = useState<PartWithRelations | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPartDetails(id);
      loadStockMovements(id);
    }
  }, [id]);

  const loadPartDetails = async (partId: string) => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select(`
          *,
          part_categories (
            id,
            name
          )
        `)
        .eq('id', partId)
        .single();

      if (error) throw error;
      setPart(data);
    } catch (error: any) {
      console.error('Error loading part details:', error);
      toast({
        title: 'Erro ao carregar detalhes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStockMovements = async (partId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('part_id', partId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      // Cast the data to match our StockMovement interface
      const movements: StockMovement[] = (data || []).map((item: any) => ({
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
      setStockMovements(movements);
    } catch (error: any) {
      console.error('Error loading stock movements:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="text-center py-8">
        <p>Peça não encontrada.</p>
        <Button onClick={() => navigate('/inventory/parts')} className="mt-4">
          Voltar para Estoque
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/inventory/parts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{part.name}</h1>
            <p className="text-muted-foreground">SKU: {part.sku}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/inventory/parts/${part.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p>{part.name}</p>
            </div>
            {part.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p>{part.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Categoria</label>
              <p>{(part as any).part_categories?.name || 'Não definida'}</p>
            </div>
            {part.manufacturer && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fabricante</label>
                <p>{part.manufacturer}</p>
              </div>
            )}
            {part.compatible_models && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modelos Compatíveis</label>
                <p>{part.compatible_models}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque e Preços */}
        <Card>
          <CardHeader>
            <CardTitle>Estoque e Preços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Status do Estoque</label>
              <StockIndicator
                currentStock={part.current_stock}
                minimumStock={part.minimum_stock}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estoque Atual</label>
                <p className="text-2xl font-bold">{part.current_stock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estoque Mínimo</label>
                <p className="text-2xl font-bold">{part.minimum_stock}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preço de Custo</label>
                <p className="text-lg font-semibold">
                  R$ {part.cost_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preço de Venda</label>
                <p className="text-lg font-semibold">
                  R$ {part.selling_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            {part.location && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Localização</label>
                <p>{part.location}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          {stockMovements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma movimentação registrada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Estoque Anterior</TableHead>
                  <TableHead>Novo Estoque</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockMovements.map((movement) => (
                  <TableRow key={movement.id}>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartDetail;
