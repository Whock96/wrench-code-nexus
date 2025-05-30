
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Part, PartCategory } from '@/types/inventory-types';
import { StockIndicator } from '@/components/inventory/StockIndicator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PartsList: React.FC = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('');

  useEffect(() => {
    loadParts();
    loadCategories();
  }, []);

  const loadParts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('parts')
        .select(`
          *,
          part_categories (
            id,
            name
          )
        `)
        .order('name');

      if (error) throw error;
      setParts(data || []);
    } catch (error: any) {
      console.error('Error loading parts:', error);
      toast({
        title: 'Erro ao carregar peças',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta peça?')) return;

    try {
      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('id', partId);

      if (error) throw error;

      toast({
        title: 'Peça excluída',
        description: 'A peça foi excluída com sucesso.',
      });

      loadParts();
    } catch (error: any) {
      console.error('Error deleting part:', error);
      toast({
        title: 'Erro ao excluir peça',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredParts = parts.filter((part) => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (part.manufacturer && part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === '' || part.category_id === selectedCategory;

    const matchesStock = 
      stockFilter === '' ||
      (stockFilter === 'in-stock' && part.current_stock >= part.minimum_stock) ||
      (stockFilter === 'low-stock' && part.current_stock < part.minimum_stock && part.current_stock > 0) ||
      (stockFilter === 'out-of-stock' && part.current_stock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

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
          <h1 className="text-3xl font-bold">Peças e Produtos</h1>
          <p className="text-muted-foreground">Gerencie o inventário da oficina</p>
        </div>
        <Button onClick={() => navigate('/inventory/parts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Peça
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, SKU ou fabricante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status do estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="in-stock">Em estoque</SelectItem>
                <SelectItem value="low-stock">Estoque baixo</SelectItem>
                <SelectItem value="out-of-stock">Sem estoque</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setStockFilter('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Peças */}
      <Card>
        <CardHeader>
          <CardTitle>
            Peças ({filteredParts.length} {filteredParts.length === 1 ? 'item' : 'itens'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead className="text-right">Preço Venda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      Nenhuma peça encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.sku}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{part.name}</p>
                          {part.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {part.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(part as any).part_categories?.name || '-'}
                      </TableCell>
                      <TableCell>{part.manufacturer || '-'}</TableCell>
                      <TableCell className="text-right">
                        {part.current_stock} / {part.minimum_stock}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {part.selling_price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <StockIndicator
                          currentStock={part.current_stock}
                          minimumStock={part.minimum_stock}
                          showText={false}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/inventory/parts/${part.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/inventory/parts/${part.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePart(part.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartsList;
