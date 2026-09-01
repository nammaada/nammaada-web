import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground ${className}`} {...props} />;
}
