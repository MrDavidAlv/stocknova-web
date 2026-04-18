import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "neutral" | "success" | "warning" | "destructive" | "info";

const variants: Record<Variant, { bg: string; dot: string }> = {
  neutral: { bg: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" },
  success: { bg: "bg-success-soft text-success-soft-foreground", dot: "bg-success" },
  warning: { bg: "bg-warning-soft text-warning-soft-foreground", dot: "bg-warning" },
  destructive: { bg: "bg-destructive-soft text-destructive-soft-foreground", dot: "bg-destructive" },
  info: { bg: "bg-info-soft text-info-soft-foreground", dot: "bg-info" },
};

export function StatusBadge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  const v = variants[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        v.bg,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
      {children}
    </span>
  );
}
