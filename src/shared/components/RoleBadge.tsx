import { cn } from "@/lib/utils";
import type { Role } from "@/core/types/api";

const styles: Record<Role, string> = {
  Admin: "bg-purple-500/20 text-purple-300 ring-purple-400/30",
  Manager: "bg-blue-500/20 text-blue-300 ring-blue-400/30",
  Viewer: "bg-slate-500/20 text-slate-300 ring-slate-400/30",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
        styles[role],
        className,
      )}
    >
      {role}
    </span>
  );
}
