
import React, { useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, RefreshCw, X } from "lucide-react";
import { ReportFilters } from "@/types/report-types";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onRefresh: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [vehicles, setVehicles] = useState<{ id: string; license_plate: string; make: string; model: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Carregar clientes para o filtro
  const loadCustomers = async () => {
    if (customers.length > 0) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");
        
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar veículos para o filtro
  const loadVehicles = async () => {
    if (vehicles.length > 0) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, license_plate, make, model")
        .order("license_plate");
        
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Aplicar filtro rápido por período
  const handleFilterPreset = (days: number) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        from: subDays(new Date(), days),
        to: new Date(),
      }
    });
  };
  
  // Limpar todos os filtros
  const handleClearFilters = () => {
    onFiltersChange({
      dateRange: {
        from: subDays(new Date(), 30),
        to: new Date(),
      }
    });
    setIsOpen(false);
  };
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-4">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFilterPreset(7)}
        >
          7 dias
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFilterPreset(30)}
        >
          30 dias
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleFilterPreset(90)}
        >
          90 dias
        </Button>
      </div>
      
      <DateRangePicker 
        date={filters.dateRange} 
        onUpdate={(range) => onFiltersChange({...filters, dateRange: range.range})} 
      />
      
      <div className="flex space-x-2 ml-auto">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsOpen(true);
                loadCustomers();
                loadVehicles();
              }}
              className={filters.customerId || filters.vehicleId || filters.status || filters.serviceType ? "bg-primary/20" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Select 
                    value={filters.customerId || ""} 
                    onValueChange={(value) => onFiltersChange({...filters, customerId: value || undefined})}
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os clientes</SelectItem>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Veículo</Label>
                  <Select 
                    value={filters.vehicleId || ""} 
                    onValueChange={(value) => onFiltersChange({...filters, vehicleId: value || undefined})}
                  >
                    <SelectTrigger id="vehicle">
                      <SelectValue placeholder="Todos os veículos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os veículos</SelectItem>
                      {vehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={filters.status || ""} 
                    onValueChange={(value) => onFiltersChange({...filters, status: value || undefined})}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovada</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="waiting_parts">Aguardando Peças</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="canceled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Tipo de Serviço</Label>
                  <Select 
                    value={filters.serviceType || ""} 
                    onValueChange={(value) => onFiltersChange({...filters, serviceType: value || undefined})}
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="service">Serviços</SelectItem>
                      <SelectItem value="part">Peças</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Valor Mínimo</Label>
                    <Input 
                      id="minAmount" 
                      type="number" 
                      placeholder="R$ 0,00" 
                      value={filters.minAmount || ""} 
                      onChange={(e) => onFiltersChange({
                        ...filters, 
                        minAmount: e.target.value ? Number(e.target.value) : undefined
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Valor Máximo</Label>
                    <Input 
                      id="maxAmount" 
                      type="number" 
                      placeholder="Sem limite" 
                      value={filters.maxAmount || ""} 
                      onChange={(e) => onFiltersChange({
                        ...filters, 
                        maxAmount: e.target.value ? Number(e.target.value) : undefined
                      })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="compare" 
                    checked={filters.compareWithPreviousPeriod || false}
                    onCheckedChange={(checked) => onFiltersChange({
                      ...filters,
                      compareWithPreviousPeriod: checked
                    })}
                  />
                  <Label htmlFor="compare">Comparar com período anterior</Label>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar Filtros
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFilters;
