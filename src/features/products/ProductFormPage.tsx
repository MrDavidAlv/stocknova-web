import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { categoriesApi, productsApi } from "@/core/api/endpoints";
import { extractApiError } from "@/core/api/client";
import type { CategoryResponse } from "@/core/types/api";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  productName: z.string().trim().min(1, "Nombre requerido").max(100, "Máximo 100 caracteres"),
  categoryId: z.string(),
  supplierId: z.string().optional(),
  quantityPerUnit: z.string().max(50, "Máximo 50 caracteres").optional(),
  unitPrice: z.string().optional(),
  unitsInStock: z.string().optional(),
  unitsOnOrder: z.string().optional(),
  reorderLevel: z.string().optional(),
  discontinued: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const toIntOrNull = (v?: string) => {
  if (v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};
const toFloatOrNull = (v?: string) => {
  if (v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

interface Props {
  mode: "create" | "edit";
}

export default function ProductFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const productId = id ? Number(id) : undefined;

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.get(productId!),
    enabled: mode === "edit" && !!productId,
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      productName: "",
      categoryId: "none",
      supplierId: "",
      quantityPerUnit: "",
      unitPrice: "",
      unitsInStock: "",
      unitsOnOrder: "",
      reorderLevel: "",
      discontinued: false,
    },
  });

  // Preload data on edit
  useEffect(() => {
    if (mode === "edit" && productQuery.data?.data) {
      const p = productQuery.data.data;
      reset({
        productName: p.productName,
        categoryId: p.categoryId ? String(p.categoryId) : "none",
        supplierId: p.supplierId != null ? String(p.supplierId) : "",
        quantityPerUnit: p.quantityPerUnit ?? "",
        unitPrice: p.unitPrice != null ? String(p.unitPrice) : "",
        unitsInStock: p.unitsInStock != null ? String(p.unitsInStock) : "",
        unitsOnOrder: p.unitsOnOrder != null ? String(p.unitsOnOrder) : "",
        reorderLevel: p.reorderLevel != null ? String(p.reorderLevel) : "",
        discontinued: p.discontinued,
      });
    }
  }, [mode, productQuery.data, reset]);

  useEffect(() => {
    document.title = mode === "create" ? "Nuevo producto · StockNova" : "Editar producto · StockNova";
  }, [mode]);

  const discontinued = watch("discontinued");

  const onSubmit = async (values: FormData) => {
    const payload = {
      productName: values.productName.trim(),
      categoryId: values.categoryId === "none" ? null : Number(values.categoryId),
      supplierId: toIntOrNull(values.supplierId),
      quantityPerUnit: values.quantityPerUnit?.trim() || null,
      unitPrice: toFloatOrNull(values.unitPrice),
      unitsInStock: toIntOrNull(values.unitsInStock),
      unitsOnOrder: toIntOrNull(values.unitsOnOrder),
      reorderLevel: toIntOrNull(values.reorderLevel),
      discontinued: values.discontinued,
    };

    try {
      if (mode === "create") {
        const res = await productsApi.create(payload);
        if (!res.success) throw new Error(res.errors?.[0] || res.message);
        toast.success("Producto creado");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        navigate(`/products/${res.data?.productId ?? ""}`.replace(/\/$/, "/products"));
      } else if (productId) {
        const res = await productsApi.update(productId, payload);
        if (!res.success) throw new Error(res.errors?.[0] || res.message);
        toast.success("Producto actualizado");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        navigate(`/products/${productId}`);
      }
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  if (mode === "edit" && productQuery.isLoading) return <LoadingSpinner label="Cargando producto…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Productos", to: "/products" },
          ...(mode === "edit" && productId
            ? [{ label: productQuery.data?.data?.productName ?? "Producto", to: `/products/${productId}` }]
            : []),
          { label: mode === "create" ? "Nuevo" : "Editar" },
        ]}
      />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Nuevo producto" : "Editar producto"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "create" ? "Añade un nuevo producto al inventario" : "Actualiza los datos del producto"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Cancelar</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border bg-card p-6 shadow-elevated" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="productName">Nombre del producto *</Label>
          <Input id="productName" {...register("productName")} placeholder="Dell PowerEdge R750" />
          {errors.productName && <p className="text-xs text-destructive">{errors.productName.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={watch("categoryId")} onValueChange={(v) => setValue("categoryId", v, { shouldDirty: true })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.categoryId} value={String(c.categoryId)}>{c.categoryName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="supplierId">Supplier ID</Label>
            <Input id="supplierId" type="number" min={1} {...register("supplierId")} placeholder="(opcional)" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quantityPerUnit">Cantidad por unidad</Label>
          <Input id="quantityPerUnit" {...register("quantityPerUnit")} placeholder="10 boxes x 20 bags" />
          {errors.quantityPerUnit && <p className="text-xs text-destructive">{errors.quantityPerUnit.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="unitPrice">Precio unitario</Label>
            <Input id="unitPrice" type="number" step="0.01" min={0} {...register("unitPrice")} placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unitsInStock">Stock</Label>
            <Input id="unitsInStock" type="number" min={0} {...register("unitsInStock")} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unitsOnOrder">En orden</Label>
            <Input id="unitsOnOrder" type="number" min={0} {...register("unitsOnOrder")} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reorderLevel">Nivel de reorden</Label>
            <Input id="reorderLevel" type="number" min={0} {...register("reorderLevel")} placeholder="0" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-4">
          <div>
            <Label htmlFor="discontinued" className="text-sm font-semibold">Descontinuado</Label>
            <p className="text-xs text-muted-foreground">El producto no estara disponible para nuevas ordenes.</p>
          </div>
          <Switch
            id="discontinued"
            checked={discontinued}
            onCheckedChange={(c) => setValue("discontinued", c, { shouldDirty: true })}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear producto" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
