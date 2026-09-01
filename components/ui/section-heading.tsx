import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; href: string };
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={`flex flex-col gap-3 ${centered ? "items-center text-center" : "items-start"}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <div className={`flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${centered ? "sm:flex-col sm:items-center" : ""}`}>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl leading-[1.05] text-foreground sm:text-4xl lg:text-5xl">{title}</h2>
          {description ? <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
        </div>
        {action ? (
          <Link className="inline-flex min-h-10 shrink-0 items-center gap-1 self-start text-sm font-semibold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto" href={action.href}>
            {action.label} <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
