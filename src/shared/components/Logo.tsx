import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  compact?: boolean;
  variant?: "default" | "light";
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, compact, variant = "default", size = "md" }: LogoProps) {
  const isLight = variant === "light";
  const iconSizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };
  const innerSizes = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5", lg: "h-6 w-6" };
  const textSizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-xl shadow-sm",
          iconSizes[size],
          isLight
            ? "bg-white/15 text-white backdrop-blur-sm"
            : "bg-gradient-to-br from-[hsl(210,100%,28%)] to-[hsl(210,100%,18%)] text-white shadow-md",
        )}
      >
        <Boxes className={innerSizes[size]} />
      </span>
      {!compact && (
        <span className={cn("font-bold tracking-tight", textSizes[size], isLight ? "text-white" : "text-foreground")}>
          Stock<span className={cn("font-semibold", isLight ? "text-white/50" : "text-muted-foreground")}>Nova</span>
        </span>
      )}
    </div>
  );
}
