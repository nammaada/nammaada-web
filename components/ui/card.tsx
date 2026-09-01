import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "bordered" | "elevated" | "subtle";
};

const variants = {
  default: "border border-border bg-card",
  bordered: "border border-primary/20 bg-card",
  elevated: "border border-border bg-card shadow-lifted",
  subtle: "border border-border/70 bg-secondary/60",
} as const;

export function Card({ className = "", variant = "default", ...props }: CardProps) {
  return <div className={`rounded-lg text-card-foreground ${variants[variant]} ${className}`} {...props} />;
}
