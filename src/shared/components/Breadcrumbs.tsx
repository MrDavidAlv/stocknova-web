import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";

export interface Crumb {
  label: ReactNode;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((c, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={i}>
            {c.to && !isLast ? (
              <Link to={c.to} className="transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground font-medium" : ""}>{c.label}</span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
          </Fragment>
        );
      })}
    </nav>
  );
}
