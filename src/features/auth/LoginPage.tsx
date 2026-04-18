import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Loader2, Package, Shield, Zap } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { Logo } from "@/shared/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Email invalido").max(256),
  password: z.string().min(1, "La contrasena es requerida"),
});

type FormData = z.infer<typeof schema>;

const features = [
  { icon: Package, label: "Inventario en tiempo real" },
  { icon: Shield, label: "Roles y permisos" },
  { icon: Zap, label: "Importacion masiva" },
];

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  useEffect(() => {
    document.title = "Iniciar sesion · StockNova";
  }, []);

  if (isAuthenticated) {
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/products";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: FormData) => {
    setApiError(null);
    try {
      await login(values);
      toast.success("Sesion iniciada");
      navigate("/products", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Credenciales invalidas";
      setApiError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-10">
      {/* Card container 50/50 */}
      <div className="flex h-[620px] w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-heavy">
        {/* Left blue half */}
        <div className="relative hidden w-1/2 overflow-hidden md:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,50%,20%)] via-[hsl(210,100%,22%)] to-[hsl(215,50%,12%)]" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[hsl(30,93%,54%)] opacity-[0.08] blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-[hsl(210,100%,50%)] opacity-[0.08] blur-3xl" />

          <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
            <Logo variant="light" />

            <div className="space-y-5">
              <h1 className="text-2xl font-bold leading-snug text-white">
                Gestion de inventario{" "}
                <span className="bg-gradient-to-r from-[hsl(30,93%,54%)] to-[hsl(3,79%,54%)] bg-clip-text text-transparent">
                  inteligente
                </span>
              </h1>
              <p className="text-sm leading-relaxed text-white/50">
                Controla productos, categorias y movimientos de stock desde un solo lugar.
              </p>
              <div className="space-y-2.5 pt-2">
                {features.map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                      <f.icon className="h-4 w-4 text-white/70" />
                    </span>
                    <span className="text-sm text-white/70">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-white/20">StockNova v1.0 · Finanzauto</p>
          </div>
        </div>

        {/* Right form half */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-10 md:w-1/2">
          <div className="mb-8 flex justify-center md:hidden">
            <Logo size="lg" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                className="h-11"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Ocultar contrasena" : "Mostrar contrasena"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {apiError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm text-destructive-soft-foreground">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Iniciar sesion
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            No tienes cuenta?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Crea una aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
