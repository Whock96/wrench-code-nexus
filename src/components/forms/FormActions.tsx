
import React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    variant?: ButtonProps["variant"];
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    variant?: ButtonProps["variant"];
  };
  tertiaryAction?: {
    label: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    variant?: ButtonProps["variant"];
  };
  align?: "start" | "center" | "end";
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  align = "end",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 mt-6",
        {
          "justify-start": align === "start",
          "justify-center": align === "center",
          "justify-end": align === "end",
        },
        className
      )}
    >
      {children}

      {tertiaryAction && (
        <Button
          type={tertiaryAction.type || "button"}
          variant={tertiaryAction.variant || "link"}
          onClick={tertiaryAction.onClick}
          disabled={tertiaryAction.disabled}
        >
          {tertiaryAction.label}
        </Button>
      )}

      {secondaryAction && (
        <Button
          type={secondaryAction.type || "button"}
          variant={secondaryAction.variant || "outline"}
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
        >
          {secondaryAction.label}
        </Button>
      )}

      {primaryAction && (
        <Button
          type={primaryAction.type || "submit"}
          variant={primaryAction.variant || "default"}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          className={cn(primaryAction.loading && "relative")}
        >
          {primaryAction.loading ? (
            <>
              <span className="opacity-0">{primaryAction.label}</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            </>
          ) : (
            primaryAction.label
          )}
        </Button>
      )}
    </div>
  );
};
