import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/core/api/endpoints";
import { extractApiError } from "@/core/api/client";
import type { ImportResult } from "@/core/types/api";
import { Breadcrumbs } from "@/shared/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/shared/utils/format";
import { cn } from "@/lib/utils";

const SAMPLE_CSV = `ProductName,SupplierId,CategoryId,QuantityPerUnit,UnitPrice,UnitsInStock,UnitsOnOrder,ReorderLevel,Discontinued
"Sample Widget",1,1,"10 boxes x 5 units",12.50,100,0,10,false
"Sample Gadget",1,1,"1 piece",4.99,250,50,25,false`;

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    document.title = "Importar productos · StockNova";
  }, []);

  const pickFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Solo se aceptan archivos .csv");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    const tick = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 15, 90)), 350);
    try {
      const res = await productsApi.importCsv(file);
      clearInterval(tick);
      setProgress(100);
      if (!res.success || !res.data) throw new Error(res.errors?.[0] || res.message);
      setResult(res.data);
      toast.success(`Importación completada: ${res.data.imported}/${res.data.totalRows}`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      clearInterval(tick);
      setProgress(0);
      toast.error(extractApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stocknova-products-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: "Productos", to: "/products" }, { label: "Importar CSV" }]} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Importar productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sube un archivo CSV para crear varios productos a la vez.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
        </Button>
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-6 shadow-card">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-muted-foreground shadow-card">
            <Upload className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Arrastra tu archivo CSV aquí</p>
            <p className="text-xs text-muted-foreground">o</p>
          </div>
          <Button variant="outline" onClick={() => inputRef.current?.click()}>Seleccionar archivo</Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          <button onClick={downloadSample} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Descargar archivo de ejemplo
          </button>
        </div>

        {file && (
          <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(null); }}>Quitar</Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importar
              </Button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">Importando productos…</p>
          </div>
        )}

        {result && (
          <div className="space-y-3 rounded-md border bg-background p-4">
            <h3 className="text-sm font-semibold">Resultado de la importación</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Total filas</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{result.totalRows}</div>
              </div>
              <div>
                <div className="text-xs text-success-soft-foreground">Importadas</div>
                <div className="mt-1 flex items-center gap-1 text-lg font-semibold tabular-nums text-success-soft-foreground">
                  <CheckCircle2 className="h-4 w-4" /> {result.imported}
                </div>
              </div>
              <div>
                <div className="text-xs text-destructive-soft-foreground">Fallidas</div>
                <div className="mt-1 flex items-center gap-1 text-lg font-semibold tabular-nums text-destructive-soft-foreground">
                  <XCircle className="h-4 w-4" /> {result.failed}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tiempo</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{result.elapsedMs} ms</div>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Errores</h4>
                <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border bg-muted/40 p-3 text-xs">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-destructive-soft-foreground">• {e}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => navigate("/products")}>Ver productos</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
