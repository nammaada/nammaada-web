"use client";

import type { InputHTMLAttributes } from "react";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  description?: string;
};

export function Switch({ label, description, name, defaultChecked, checked, onChange, disabled, className = "", id, ...props }: SwitchProps) {
  const switchId = id || (name ? `switch-${name}` : undefined);

  return (
    <label className={`inline-flex items-start gap-3 select-none cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`} htmlFor={switchId}>
      <div className="relative inline-flex items-center shrink-0 mt-0.5">
        <input
          checked={checked}
          className="peer sr-only"
          defaultChecked={defaultChecked}
          disabled={disabled}
          id={switchId}
          name={name}
          onChange={onChange}
          type="checkbox"
          {...props}
        />
        <div className="h-6 w-11 rounded-full bg-border/80 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-card" />
        <div className="absolute left-1 top-1 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 shadow-xs" />
      </div>
      {(label || description) && (
        <div className="grid gap-0.5">
          {label && <span className="text-sm font-semibold text-foreground">{label}</span>}
          {description && <span className="text-xs text-muted-foreground">{description}</span>}
        </div>
      )}
    </label>
  );
}
