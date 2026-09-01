import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "accent" | "default" | "success" | "warning" | "danger";
};

const variants = {
  accent: "bg-accent/20 text-primary",
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-900/10 text-emerald-900",
  warning: "bg-amber-700/15 text-amber-950",
  danger: "bg-red-900/10 text-red-900",
} as const;

export function Badge({ className = "", variant = "accent", ...props }: BadgeProps) {
  return <span className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`} {...props} />;
}
