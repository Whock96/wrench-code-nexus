
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
        color: 'bg-destructive',
        textColor: 'text-destructive',
        borderColor: 'border-destructive',
      };
    } else if (currentStock < minimumStock) {
      return {
        status: 'low-stock',
        label: 'Estoque baixo',
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
        borderColor: 'border-amber-500',
      };
    } else {
      return {
        status: 'in-stock',
        label: 'Em estoque',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        borderColor: 'border-green-500',
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
              <span className={`text-sm ${status.textColor}`}>
                {status.label} ({currentStock})
              </span>
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
