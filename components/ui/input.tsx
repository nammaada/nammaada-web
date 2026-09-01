import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export function Input({ className = "", error = false, ...props }: InputProps) {
  return (
    <input
      aria-invalid={error || undefined}
      className={`min-h-11 w-full rounded-lg border bg-card px-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 ${error ? "border-red-800 focus-visible:border-red-800 focus-visible:ring-red-800/20" : "border-input"} ${className}`}
      {...props}
    />
  );
}
