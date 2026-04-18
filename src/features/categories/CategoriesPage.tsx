import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderTree, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/core/auth/AuthContext";
import { categoriesApi } from "@/core/api/endpoints";
import { extractApiError } from "@/core/api/client";
import type { CategoryResponse } from "@/core/types/api";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const schema = z.object({
  categoryName: z.string().trim().min(1, "Nombre requerido").max(100, "Maximo 100 caracteres"),
  description: z.string().trim().max(500, "Maximo 500 caracteres").optional(),
});
type FormData = z.infer<typeof schema>;

function CategoryCard({ c }: { c: CategoryResponse }) {
  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-muted/60 to-muted">
        {c.picture ? (
          <img
            src={`data:image/bmp;base64,${c.picture}`}
            alt={c.categoryName}
            className="max-h-full max-w-full object-contain p-4"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FolderTree className="h-7 w-7" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold tracking-tight">{c.categoryName}</h3>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {c.description || "Sin descripcion"}
        </p>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    document.title = "Categorias · StockNova";
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  const categories = useMemo<CategoryResponse[]>(() => {
    const d = data?.data;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    return d.items ?? [];
  }, [data]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { categoryName: "", description: "" },
  });

  const onSubmit = async (values: FormData) => {
    try {
      const res = await categoriesApi.create({
        categoryName: values.categoryName.trim(),
        description: values.description?.trim() || null,
        picture: null,
      });
      if (!res.success) throw new Error(res.errors?.[0] || res.message);
      toast.success("Categoria creada");
      reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organiza tus productos por categorias.
          </p>
        </div>
        {hasRole("Admin", "Manager") && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="btn-gradient flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm">
                <Plus className="h-4 w-4" /> Nueva categoria
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva categoria</DialogTitle>
                <DialogDescription>Crea una nueva categoria para clasificar productos.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="categoryName">Nombre *</Label>
                  <Input id="categoryName" {...register("categoryName")} placeholder="Electronica" />
                  {errors.categoryName && <p className="text-xs text-destructive">{errors.categoryName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Descripcion</Label>
                  <Textarea id="description" rows={3} {...register("description")} placeholder="Productos electronicos y accesorios" />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner label="Cargando categorias..." />
      ) : isError ? (
        <EmptyState title="Error" description={extractApiError(error)} />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-5 w-5" />}
          title="Sin categorias"
          description="Crea tu primera categoria para empezar a organizar productos."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.categoryId} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
