import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "bordered" | "elevated" | "subtle";
};

const variants = {
  default: "border border-[#e5d8c6] bg-[#fffdf8]",
  bordered: "border border-[#4a0e17]/25 bg-[#fffdf8]",
  elevated: "border border-[#e5d8c6] bg-[#fffdf8] shadow-lifted",
  subtle: "border border-[#e5d8c6]/80 bg-[#f4efeb]",
} as const;

export function Card({ className = "", variant = "default", ...props }: CardProps) {
  return <div className={`rounded-2xl text-[#2b1719] ${variants[variant]} ${className}`} {...props} />;
}

