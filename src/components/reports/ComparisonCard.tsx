
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  formatValue?: (value: number) => string;
  icon?: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  currentValue,
  previousValue,
  formatValue = (value) => value.toString(),
  icon,
  description,
  isLoading = false
}) => {
  // Calcular variação percentual
  const calculateVariation = (): { value: number; isPositive: boolean } => {
    if (previousValue === 0) return { value: 0, isPositive: true };
    const variation = ((currentValue - previousValue) / previousValue) * 100;
    return {
      value: Math.abs(variation),
      isPositive: variation >= 0
    };
  };
  
  const variation = calculateVariation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "..." : formatValue(currentValue)}
        </div>
        <div className="flex items-center mt-1">
          <span className={`text-xs ${variation.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {variation.isPositive ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
            {variation.value.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            vs período anterior
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ComparisonCard;
