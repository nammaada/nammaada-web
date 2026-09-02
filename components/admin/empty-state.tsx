import type { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon = <FolderOpen className="size-8 text-muted-foreground/60" />, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-xl border border-dashed border-border bg-card/50">
      <div className="rounded-full bg-secondary/80 p-4 mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="font-display text-lg text-foreground mb-1">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
