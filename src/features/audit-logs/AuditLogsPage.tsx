import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { auditApi } from "@/core/api/endpoints";
import { extractApiError } from "@/core/api/client";
import type { AuditLogParams, AuditLogResponse, PagedResult } from "@/core/types/api";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatDateTime, formatNumber } from "@/shared/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIONS = ["Product.Create", "Product.Update", "Product.Delete", "Category.Create", "Login", "Register"];
const ENTITIES = ["Product", "Category", "User"];

function levelVariant(level: string): "info" | "warning" | "destructive" | "neutral" {
  if (level === "Information") return "info";
  if (level === "Warning") return "warning";
  if (level === "Error") return "destructive";
  return "neutral";
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogParams>({ page: 1, pageSize: 25 });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [action, setAction] = useState("all");
  const [entity, setEntity] = useState("all");

  useEffect(() => {
    document.title = "Audit Logs · StockNova";
  }, []);

  const apply = () => {
    setFilters({
      page: 1,
      pageSize: 25,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      action: action !== "all" ? action : undefined,
      entityName: entity !== "all" ? entity : undefined,
    });
  };

  const reset = () => {
    setFrom(""); setTo(""); setAction("all"); setEntity("all");
    setFilters({ page: 1, pageSize: 25 });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["auditlogs", filters],
    queryFn: () => auditApi.list(filters),
  });

  const { items, paging } = useMemo(() => {
    const d = data?.data;
    if (!d) return { items: [] as AuditLogResponse[], paging: undefined as undefined | PagedResult<AuditLogResponse> };
    if (Array.isArray(d)) return { items: d, paging: undefined };
    return { items: d.items, paging: d };
  }, [data]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Historial de acciones realizadas en el sistema.</p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-elevated">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs">Desde</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs">Hasta</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Acción</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Entidad</Label>
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {ENTITIES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={apply} className="flex-1">Aplicar</Button>
            <Button variant="outline" onClick={reset}>Limpiar</Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-elevated">
        <div className="overflow-x-auto">
          {isLoading ? (
            <LoadingSpinner label="Cargando logs…" />
          ) : isError ? (
            <EmptyState title="Error" description={extractApiError(error)} />
          ) : items.length === 0 ? (
            <EmptyState icon={<History className="h-5 w-5" />} title="Sin registros" description="No hay logs para los filtros actuales." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Usuario</th>
                  <th className="px-4 py-3 font-semibold">Acción</th>
                  <th className="px-4 py-3 font-semibold">Entidad</th>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Mensaje</th>
                  <th className="px-4 py-3 font-semibold">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 transition-colors hover:bg-primary/[0.03]">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(log.timestamp)}</td>
                    <td className="px-4 py-3">{log.userEmail ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                    <td className="px-4 py-3">{log.entityName ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{log.entityId ?? "—"}</td>
                    <td className="px-4 py-3 max-w-md truncate text-muted-foreground" title={log.message ?? ""}>{log.message ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={levelVariant(log.level)}>{log.level}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {paging && items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm">
            <div className="text-muted-foreground">
              Página {paging.currentPage} de {paging.totalPages || 1} · {formatNumber(paging.totalCount)} registros
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                disabled={!paging.hasPrevious}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                aria-label="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                disabled={!paging.hasNext}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                aria-label="Siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
