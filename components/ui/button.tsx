import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
};

const variants = {
  primary: "bg-[#711e2c] text-white shadow-sm hover:bg-[#5a1723] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring/40",
  secondary: "bg-[#f4efeb] text-[#711e2c] border border-[#e5d8c6] hover:bg-[#eae1d7] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring/40",
  outline: "border border-[#711e2c]/30 bg-transparent text-[#711e2c] hover:border-[#711e2c] hover:bg-[#711e2c]/5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring/40",
  ghost: "text-[#2b1719]/85 hover:bg-[#711e2c]/10 hover:text-[#711e2c] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring/40",
  destructive: "bg-red-900 text-white hover:bg-red-950 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-900/40",
} as const;

const sizes = {
  sm: "min-h-11 px-4 text-xs sm:text-sm font-semibold gap-1.5",
  md: "min-h-11 sm:min-h-12 px-5 text-sm font-semibold gap-2",
  lg: "min-h-12 sm:min-h-13 px-6 sm:px-7 text-sm sm:text-base font-semibold gap-2.5",
  icon: "h-11 w-11 p-0 gap-0",
} as const;

export function Button({ className = "", variant = "primary", size = "md", isLoading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
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


