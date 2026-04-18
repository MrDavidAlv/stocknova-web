import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Package,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/core/auth/AuthContext";
import { categoriesApi, productsApi } from "@/core/api/endpoints";
import { extractApiError } from "@/core/api/client";
import type { CategoryResponse, ProductFilterParams, ProductResponse } from "@/core/types/api";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { SearchInput } from "@/shared/components/SearchInput";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { EmptyState } from "@/shared/components/EmptyState";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { formatCurrency, formatNumber } from "@/shared/utils/format";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

type SortField = NonNullable<ProductFilterParams["sortBy"]>;

interface Filters {
  search: string;
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  discontinued: "all" | "true" | "false";
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  categoryId: "all",
  minPrice: "",
  maxPrice: "",
  discontinued: "all",
  sortBy: "ProductName",
  sortOrder: "asc",
  page: 1,
  pageSize: 10,
};

function stockTone(p: ProductResponse): "destructive" | "warning" | "success" | "neutral" {
  const stock = p.unitsInStock ?? 0;
  const reorder = p.reorderLevel ?? 0;
  if (reorder <= 0) return stock > 0 ? "success" : "neutral";
  if (stock < reorder) return "destructive";
  if (stock < reorder * 2) return "warning";
  return "success";
}

export default function ProductsListPage() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);

  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Productos · StockNova";
  }, []);

  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const queryParams = useMemo<ProductFilterParams>(() => {
    const params: ProductFilterParams = {
      page: filters.page,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    if (filters.search) params.search = filters.search;
    if (filters.categoryId !== "all") params.categoryId = Number(filters.categoryId);
    if (filters.minPrice) params.minPrice = Number(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);
    if (filters.discontinued !== "all") params.discontinued = filters.discontinued === "true";
    return params;
  }, [filters]);

  const productsQuery = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productsApi.list(queryParams),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const categories = useMemo<CategoryResponse[]>(() => {
    const data = categoriesQuery.data?.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.items ?? [];
  }, [categoriesQuery.data]);

  const items = productsQuery.data?.data?.items ?? [];
  const paging = productsQuery.data?.data;

  const toggleSort = (field: SortField) => {
    setFilters((f) => ({
      ...f,
      sortBy: field,
      sortOrder: f.sortBy === field ? (f.sortOrder === "asc" ? "desc" : "asc") : "asc",
      page: 1,
    }));
  };

  const sortIcon = (field: SortField) => {
    if (filters.sortBy !== field) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
    return filters.sortOrder === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await productsApi.remove(deleteTarget.productId);
      if (!res.success) throw new Error(res.errors?.[0] || res.message);
      toast.success("Producto eliminado");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const activeFilterCount =
    (filters.categoryId !== "all" ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.discontinued !== "all" ? 1 : 0);

  const FiltersBody = (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Categoria</Label>
        <Select
          value={filters.categoryId}
          onValueChange={(v) => setFilters((f) => ({ ...f, categoryId: v, page: 1 }))}
        >
          <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.categoryId} value={String(c.categoryId)}>
                {c.categoryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Rango de precio</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value, page: 1 }))}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Estado</Label>
        <Select
          value={filters.discontinued}
          onValueChange={(v) => setFilters((f) => ({ ...f, discontinued: v as Filters["discontinued"], page: 1 }))}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="false">Activos</SelectItem>
            <SelectItem value="true">Descontinuados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() =>
            setFilters((f) => ({
              ...f,
              categoryId: "all",
              minPrice: "",
              maxPrice: "",
              discontinued: "all",
              page: 1,
            }))
          }
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {paging ? `${formatNumber(paging.totalCount)} productos en total` : "Gestiona tu inventario"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasRole("Admin") && (
            <Button variant="outline" asChild className="shadow-sm">
              <Link to="/products/import"><Upload className="mr-2 h-4 w-4" /> Importar CSV</Link>
            </Button>
          )}
          {hasRole("Admin", "Manager") && (
            <button className="btn-gradient flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm">
              <Link to="/products/new" className="flex items-center gap-2 text-white">
                <Plus className="h-4 w-4" /> Nuevo producto
              </Link>
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-elevated">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b bg-muted/30 px-4 py-3">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Buscar por nombre..."
            className="min-w-0 flex-1 sm:max-w-xs"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 shadow-sm">
                <Filter className="h-4 w-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{FiltersBody}</div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {productsQuery.isLoading ? (
            <LoadingSpinner label="Cargando productos..." />
          ) : productsQuery.isError ? (
            <EmptyState
              icon={<Package className="h-5 w-5" />}
              title="No se pudieron cargar los productos"
              description={extractApiError(productsQuery.error)}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Package className="h-5 w-5" />}
              title="Sin productos"
              description="No se encontraron productos con los filtros actuales."
            />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3.5">
                    <button onClick={() => toggleSort("ProductName")} className="font-semibold uppercase hover:text-foreground">
                      Producto {sortIcon("ProductName")}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Categoria</th>
                  <th className="px-4 py-3.5 text-right">
                    <button onClick={() => toggleSort("UnitPrice")} className="font-semibold uppercase hover:text-foreground">
                      Precio {sortIcon("UnitPrice")}
                    </button>
                  </th>
                  <th className="px-4 py-3.5 text-right">
                    <button onClick={() => toggleSort("UnitsInStock")} className="font-semibold uppercase hover:text-foreground">
                      Stock {sortIcon("UnitsInStock")}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="w-1 px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((p) => {
                  const tone = stockTone(p);
                  return (
                    <tr
                      key={p.productId}
                      className="group transition-colors hover:bg-primary/[0.03]"
                    >
                      <td className="px-4 py-3.5">
                        <Link to={`/products/${p.productId}`} className="font-medium text-foreground hover:text-primary hover:underline">
                          {p.productName}
                        </Link>
                        {p.quantityPerUnit && (
                          <div className="mt-0.5 text-xs text-muted-foreground">{p.quantityPerUnit}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{p.categoryName ?? "—"}</td>
                      <td className="px-4 py-3.5 text-right font-medium tabular-nums">{formatCurrency(p.unitPrice)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={cn(
                            "inline-flex min-w-[3.5rem] justify-center rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums",
                            tone === "destructive" && "bg-destructive-soft text-destructive-soft-foreground",
                            tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
                            tone === "success" && "bg-success-soft text-success-soft-foreground",
                            tone === "neutral" && "bg-muted text-muted-foreground",
                          )}
                        >
                          {formatNumber(p.unitsInStock)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.discontinued ? (
                          <StatusBadge variant="destructive">Descontinuado</StatusBadge>
                        ) : (
                          <StatusBadge variant="success">Activo</StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/products/${p.productId}`)} aria-label="Ver">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasRole("Admin", "Manager") && (
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/products/${p.productId}/edit`)} aria-label="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {hasRole("Admin") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:bg-destructive-soft hover:text-destructive-soft-foreground"
                              onClick={() => setDeleteTarget(p)}
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {paging && items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 text-sm">
            <div className="text-muted-foreground">
              Mostrando{" "}
              <span className="font-semibold text-foreground">
                {(paging.currentPage - 1) * paging.pageSize + 1}–
                {Math.min(paging.currentPage * paging.pageSize, paging.totalCount)}
              </span>{" "}
              de <span className="font-semibold text-foreground">{formatNumber(paging.totalCount)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Por pagina</span>
                <Select
                  value={String(filters.pageSize)}
                  onValueChange={(v) => setFilters((f) => ({ ...f, pageSize: Number(v), page: 1 }))}
                >
                  <SelectTrigger className="h-8 w-[72px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shadow-sm"
                  disabled={!paging.hasPrevious}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-xs font-medium text-muted-foreground">
                  {paging.currentPage} / {paging.totalPages || 1}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shadow-sm"
                  disabled={!paging.hasNext}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Eliminar ${deleteTarget?.productName ?? "producto"}`}
        description="Esta accion se puede revertir. Quieres continuar?"
        confirmLabel="Eliminar"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
