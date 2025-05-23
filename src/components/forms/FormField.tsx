
import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BaseFormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface InputFieldProps extends BaseFormFieldProps {
  type: "text" | "email" | "password" | "number" | "tel" | "url" | "date";
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaFieldProps extends BaseFormFieldProps {
  type: "textarea";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

interface SelectFieldProps extends BaseFormFieldProps {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { id, label, error, required, className } = props;
  
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="flex">
        {label} {required && <span className="ml-1 text-secondary">*</span>}
      </Label>
      
      {props.type === "textarea" ? (
        <Textarea
          id={id}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          rows={props.rows || 3}
          className={cn(error && "border-destructive")}
        />
      ) : props.type === "select" ? (
        <Select value={props.value} onValueChange={props.onChange}>
          <SelectTrigger id={id} className={cn(error && "border-destructive")}>
            <SelectValue />
          </SelectTrigger>
          {props.children}
        </Select>
      ) : (
        <Input
          id={id}
          type={props.type}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          className={cn(error && "border-destructive")}
        />
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
