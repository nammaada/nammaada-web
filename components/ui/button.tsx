import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
};

const variants = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring/40",
  secondary: "bg-secondary text-secondary-foreground border border-border/80 hover:bg-secondary/80 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring/40",
  outline: "border border-primary/30 bg-card text-primary hover:border-primary hover:bg-primary/5 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring/40",
  ghost: "text-foreground/80 hover:bg-primary/10 hover:text-primary active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring/40",
  destructive: "bg-red-950 text-white hover:bg-red-900 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-red-900/40",
} as const;

const sizes = {
  sm: "min-h-9 px-3.5 text-xs gap-1.5",
  md: "min-h-10 px-4 text-sm gap-2",
  lg: "min-h-12 px-6 text-base gap-2.5",
} as const;

export function Button({ className = "", variant = "primary", size = "md", isLoading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-semibold tracking-wide transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="size-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

