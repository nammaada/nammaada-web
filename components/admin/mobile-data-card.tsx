import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type MobileDataCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  thumbnail?: ReactNode;
  details: { label: string; value: ReactNode }[];
  actions?: ReactNode;
};

export function MobileDataCard({ title, subtitle, badge, thumbnail, details, actions }: MobileDataCardProps) {
  return (
    <Card className="p-4 flex flex-col gap-3 shadow-xs">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-center gap-3">
          {thumbnail}
          <div>
            <div className="font-semibold text-base text-foreground">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {badge}
      </div>

      {details.length > 0 && (
        <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/60 text-xs">
          {details.map((d, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-muted-foreground uppercase tracking-wider font-medium text-[10px]">{d.label}</span>
              <span className="font-semibold text-foreground mt-0.5">{d.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && <div className="flex items-center justify-end gap-2 pt-1">{actions}</div>}
    </Card>
  );
}
