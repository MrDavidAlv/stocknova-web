import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/core/auth/AuthContext";
import { Logo } from "@/shared/components/Logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .string()
  .min(6, "Minimo 6 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos 1 mayuscula")
  .regex(/[0-9]/, "Debe contener al menos 1 numero")
  .regex(/[!@#$%^&*]/, "Debe contener al menos 1 caracter especial (!@#$%^&*)");

const schema = z
  .object({
    fullName: z.string().trim().min(1, "Nombre requerido").max(100, "Maximo 100 caracteres"),
    email: z.string().trim().email("Email invalido").max(256),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function passwordStrength(pwd: string): { score: number; label: string; tone: "destructive" | "warning" | "success" | "muted" } {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (!pwd) return { score: 0, label: "", tone: "muted" };
  if (score <= 2) return { score, label: "Debil", tone: "destructive" };
  if (score === 3) return { score, label: "Aceptable", tone: "warning" };
  return { score, label: "Fuerte", tone: "success" };
}

const perks = [
  "Control total de inventario",
  "Roles Admin, Manager y Viewer",
  "Importacion CSV masiva",
];

export default function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const pwd = watch("password");
  const strength = useMemo(() => passwordStrength(pwd ?? ""), [pwd]);

  useEffect(() => {
    document.title = "Crear cuenta · StockNova";
  }, []);

  if (isAuthenticated) return <Navigate to="/products" replace />;

  const onSubmit = async (values: FormData) => {
    setApiError(null);
    try {
      await registerUser({ fullName: values.fullName, email: values.email, password: values.password });
      toast.success("Cuenta creada");
      navigate("/products", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo registrar";
      setApiError(msg);
    }
  };

  const barTone = {
    destructive: "bg-destructive",
    warning: "bg-warning",
    success: "bg-success",
    muted: "bg-muted",
  } as const;

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
                Empieza a gestionar tu{" "}
                <span className="bg-gradient-to-r from-[hsl(30,93%,54%)] to-[hsl(3,79%,54%)] bg-clip-text text-transparent">
                  inventario
                </span>{" "}
                hoy
              </h1>
              <div className="space-y-2.5 pt-2">
                {perks.map((p) => (
                  <div key={p} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400/70" />
                    <span className="text-sm text-white/70">{p}</span>
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
            <h2 className="text-2xl font-bold tracking-tight">Crear cuenta</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Completa tus datos para empezar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" autoComplete="name" placeholder="Juan Garcia" className="h-11" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electronico</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="tu@empresa.com" className="h-11" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
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
              {pwd && (
                <div className="space-y-1">
                  <div className="flex h-1.5 gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-full flex-1 rounded-full transition-colors",
                          i < strength.score ? barTone[strength.tone] : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-muted-foreground">
                      Fortaleza: <span className="font-semibold text-foreground">{strength.label}</span>
                    </p>
                  )}
                </div>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
              <Input
                id="confirmPassword"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-11"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
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
                  Crear cuenta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
