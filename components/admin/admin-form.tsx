"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="grid gap-4 py-2 border-b border-border/60 last:border-0">
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="grid gap-4 mt-1">{children}</div>
    </div>
  );
}

export function AdminField({
  label,
  name,
  defaultValue,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  helperText,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | readonly string[];
  value?: string | number | readonly string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  children?: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-foreground">
      <span className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-800 text-xs">*</span>}
      </span>
      {children ?? (
        <input
          className="min-h-10 w-full rounded-lg border border-input bg-card px-3.5 text-sm font-normal text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          defaultValue={defaultValue}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
        />
      )}
      {helperText && <span className="text-xs font-normal text-muted-foreground">{helperText}</span>}
    </label>
  );
}

export function MoneyField({ label, name, paise, required = true, helperText }: { label: string; name: string; paise?: number; required?: boolean; helperText?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-foreground">
      <span className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-800 text-xs">*</span>}
      </span>
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-sm font-semibold text-muted-foreground select-none">₹</span>
        <input
          className="min-h-10 w-full rounded-lg border border-input bg-card pl-8 pr-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          defaultValue={paise === undefined || paise === null ? "" : (paise / 100).toFixed(2)}
          min="0"
          name={name}
          placeholder="0.00"
          required={required}
          step="0.01"
          type="number"
        />
      </div>
      {helperText ? <span className="text-xs font-normal text-muted-foreground">{helperText}</span> : <span className="text-[11px] font-normal text-muted-foreground">Price in INR (e.g. 100 or 100.50)</span>}
    </label>
  );
}

export function CheckField({ label, name, defaultChecked, description }: { label: string; name: string; defaultChecked?: boolean; description?: string }) {
  return <Switch defaultChecked={defaultChecked} description={description} label={label} name={name} />;
}

export function Submit({ label = "Save changes", variant = "primary", size = "md", className = "", disabled = false }: { label?: string; variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive"; size?: "sm" | "md" | "lg"; className?: string; disabled?: boolean }) {
  return (
    <Button className={className} disabled={disabled} size={size} type="submit" variant={variant}>
      {label}
    </Button>
  );
}
