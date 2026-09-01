import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
};

const variants = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/75 active:bg-secondary",
  outline: "border border-primary/35 bg-transparent text-primary hover:border-primary hover:bg-primary/5 active:bg-primary/10",
  ghost: "text-primary hover:bg-primary/10 active:bg-primary/15",
  destructive: "bg-red-900 text-white hover:bg-red-950 active:bg-red-900",
} as const;

const sizes = {
  sm: "min-h-10 px-4 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-sm",
} as const;

export function Button({ className = "", variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
