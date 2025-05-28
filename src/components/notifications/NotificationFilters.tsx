
import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { NotificationFilters, NOTIFICATION_TYPE_LABELS } from '@/types/notification-types';
import { DateRange } from 'react-day-picker';

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
}

export const NotificationFiltersComponent = ({ filters, onFiltersChange }: NotificationFiltersProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type });
  };

  const handleStatusChange = (status: 'all' | 'read' | 'unread') => {
    onFiltersChange({ ...filters, status });
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: dateRange ? { from: dateRange.from!, to: dateRange.to } : undefined 
    });
  };

  const clearFilters = () => {
    onFiltersChange({ type: 'all', status: 'all' });
  };

  return (
    <div className="p-4 bg-white border-b">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={filters.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de notificação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">Não lidas</SelectItem>
            <SelectItem value="read">Lidas</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          {filters.dateRange?.from ? 'Data selecionada' : 'Selecionar período'}
        </Button>
        
        <Button variant="ghost" onClick={clearFilters} className="text-gray-500">
          Limpar filtros
        </Button>
      </div>
      
      {showDatePicker && (
        <div className="mt-4">
          <DatePickerWithRange
            value={filters.dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
      )}
    </div>
  );
};
