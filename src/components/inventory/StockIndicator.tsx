
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StockIndicatorProps {
  currentStock: number;
  minimumStock: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StockIndicator: React.FC<StockIndicatorProps> = ({
  currentStock,
  minimumStock,
  showText = true,
  size = 'md',
}) => {
  const getStockStatus = () => {
    if (currentStock <= 0) {
      return {
        status: 'out-of-stock',
        label: 'Sem estoque',
        variant: 'destructive' as const,
        color: 'bg-red-500',
      };
    } else if (currentStock < minimumStock) {
      return {
        status: 'low-stock',
        label: 'Estoque baixo',
        variant: 'secondary' as const,
        color: 'bg-amber-500',
      };
    } else {
      return {
        status: 'in-stock',
        label: 'Em estoque',
        variant: 'default' as const,
        color: 'bg-green-500',
      };
    }
  };
  
  const status = getStockStatus();
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={`rounded-full ${status.color} ${sizeClasses[size]}`} />
            {showText && (
              <Badge variant={status.variant}>
                {status.label} ({currentStock})
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Estoque atual: {currentStock}</p>
          <p>Estoque mínimo: {minimumStock}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
