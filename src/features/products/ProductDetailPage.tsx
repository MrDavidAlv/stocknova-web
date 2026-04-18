import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/core/auth/AuthContext";
import { productsApi } from "@/core/api/endpoints";
import { extractApiError } from "@/core/api/client";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { formatCurrency, formatDateTime, formatNumber } from "@/shared/utils/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-card">
      <h2 className="mb-5 text-sm font-bold tracking-tight text-foreground">{title}</h2>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const productId = Number(id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.get(productId),
    enabled: !Number.isNaN(productId),
  });
  const product = data?.data;

  useEffect(() => {
    document.title = product?.productName ? `${product.productName} · StockNova` : "Producto · StockNova";
  }, [product?.productName]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await productsApi.remove(productId);
      if (!res.success) throw new Error(res.errors?.[0] || res.message);
      toast.success("Producto eliminado");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Cargando producto..." />;
  if (isError || !product)
    return (
      <EmptyState
        title="No se pudo cargar el producto"
        description={extractApiError(error)}
        action={<Button asChild variant="outline"><Link to="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link></Button>}
      />
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Breadcrumbs
        items={[{ label: "Productos", to: "/products" }, { label: product.productName }]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{product.productName}</h1>
            {product.discontinued ? (
              <StatusBadge variant="destructive">Descontinuado</StatusBadge>
            ) : (
              <StatusBadge variant="success">Activo</StatusBadge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ID #{product.productId} · {product.categoryName ?? "Sin categoria"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="shadow-sm">
            <Link to="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
          </Button>
          {hasRole("Admin", "Manager") && (
            <button className="btn-gradient flex items-center gap-2 rounded-lg px-4 py-2 text-sm">
              <Link to={`/products/${product.productId}/edit`} className="flex items-center gap-2 text-white">
                <Pencil className="h-4 w-4" /> Editar
              </Link>
            </button>
          )}
          {hasRole("Admin") && (
            <Button variant="outline" className="border-destructive/30 text-destructive shadow-sm hover:bg-destructive-soft" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Section title="Informacion general">
            <Field label="Cantidad por unidad" value={product.quantityPerUnit} />
            <Field label="Precio unitario" value={<span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(product.unitPrice)}</span>} />
            <Field label="Stock" value={<span className="tabular-nums">{formatNumber(product.unitsInStock)}</span>} />
            <Field label="En orden" value={<span className="tabular-nums">{formatNumber(product.unitsOnOrder)}</span>} />
            <Field label="Nivel de reorden" value={<span className="tabular-nums">{formatNumber(product.reorderLevel)}</span>} />
            <Field label="Estado" value={product.discontinued ? "Descontinuado" : "Activo"} />
          </Section>

          <Section title="Proveedor">
            <Field label="Nombre" value={product.supplierName} />
            <Field label="Contacto" value={product.supplierContactName} />
            <Field label="Telefono" value={product.supplierPhone} />
            <Field label="Pais" value={product.supplierCountry} />
          </Section>

          <Section title="Metadatos">
            <Field label="Creado" value={formatDateTime(product.createdAt)} />
            <Field label="Actualizado" value={formatDateTime(product.updatedAt)} />
          </Section>
        </div>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-xl border bg-card shadow-card">
            <div className="border-b bg-muted/30 px-6 py-3">
              <h2 className="text-sm font-bold tracking-tight">Categoria</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {product.categoryPicture && (
                  <img
                    src={`data:image/bmp;base64,${product.categoryPicture}`}
                    alt={product.categoryName ?? "Imagen de categoria"}
                    className="h-32 w-full rounded-lg border bg-muted/30 object-contain p-2"
                  />
                )}
                <div>
                  <div className="text-sm font-semibold">{product.categoryName ?? "—"}</div>
                  {product.categoryDescription && (
                    <p className="mt-1 text-xs text-muted-foreground">{product.categoryDescription}</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Eliminar ${product.productName}`}
        description="Esta accion se puede revertir. Quieres continuar?"
        confirmLabel="Eliminar"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
