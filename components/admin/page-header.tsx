import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
};

export function PageHeader({ eyebrow = "ADMIN", title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {breadcrumbs.map((b, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3 text-muted-foreground/60" />}
                  {b.href ? (
                    <Link className="hover:text-primary transition-colors font-medium" href={b.href}>
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-semibold">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : eyebrow ? (
          <p className="eyebrow">{eyebrow}</p>
        ) : null}

        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  );
}
