
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Part } from '@/types/inventory-types';
import { StockIndicator } from '@/components/inventory/StockIndicator';

interface InventoryStats {
  totalParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  totalValue: number;
}

const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<InventoryStats>({
    totalParts: 0,
    lowStockParts: 0,
    outOfStockParts: 0,
    totalValue: 0,
  });
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar todas as peças para calcular estatísticas
      const { data: parts, error } = await supabase
        .from('parts')
        .select('*')
        .order('name');

      if (error) throw error;

      if (parts) {
        const totalParts = parts.length;
        const lowStockParts = parts.filter(part => part.current_stock < part.minimum_stock && part.current_stock > 0);
        const outOfStockParts = parts.filter(part => part.current_stock === 0);
        const totalValue = parts.reduce((sum, part) => sum + (part.current_stock * part.cost_price), 0);

        setStats({
          totalParts,
          lowStockParts: lowStockParts.length,
          outOfStockParts: outOfStockParts.length,
          totalValue,
        });

        // Mostrar apenas os 10 primeiros itens com estoque baixo
        setLowStockParts(lowStockParts.slice(0, 10));
      }
    } catch (error: any) {
      console.error('Error loading inventory dashboard:', error);
      toast({
        title: 'Erro ao carregar dashboard',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Estoque</h1>
          <p className="text-muted-foreground">Visão geral do inventário</p>
        </div>
        <Button onClick={() => navigate('/inventory/parts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Peça
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Peças</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParts}</div>
            <p className="text-xs text-muted-foreground">
              Itens cadastrados no estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.lowStockParts}</div>
            <p className="text-xs text-muted-foreground">
              Itens abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStockParts}</div>
            <p className="text-xs text-muted-foreground">
              Itens em falta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total do inventário
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Estoque Baixo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alertas de Estoque</CardTitle>
            <Button variant="outline" onClick={() => navigate('/inventory/parts')}>
              Ver Todos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lowStockParts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum alerta de estoque no momento.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockParts.map((part) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/inventory/parts/${part.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <StockIndicator
                      currentStock={part.current_stock}
                      minimumStock={part.minimum_stock}
                      showText={false}
                    />
                    <div>
                      <h4 className="font-medium">{part.name}</h4>
                      <p className="text-sm text-muted-foreground">SKU: {part.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {part.current_stock} / {part.minimum_stock}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      R$ {part.selling_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/inventory/parts')}>
          <CardHeader>
            <CardTitle className="text-lg">Gerenciar Peças</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Visualizar, adicionar e editar peças do estoque
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/inventory/movements')}>
          <CardHeader>
            <CardTitle className="text-lg">Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Registrar entradas e saídas de estoque
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/inventory/suppliers')}>
          <CardHeader>
            <CardTitle className="text-lg">Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gerenciar fornecedores e relacionamentos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryDashboard;
