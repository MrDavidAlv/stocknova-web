import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FolderTree, History, LogOut, Menu, Package, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/core/auth/AuthContext";
import { Logo } from "@/shared/components/Logo";
import { RoleBadge } from "@/shared/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import type { Role } from "@/core/types/api";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Package;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { to: "/products", label: "Productos", icon: Package },
  { to: "/categories", label: "Categorias", icon: FolderTree },
  { to: "/audit-logs", label: "Audit Logs", icon: History, roles: ["Admin"] },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { hasRole } = useAuth();
  const visible = navItems.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <div className="space-y-1.5">
      <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/40">
        Menu
      </p>
      <nav className="flex flex-col gap-1 px-3">
        {visible.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/12 text-white shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-white/8 hover:text-sidebar-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[hsl(30,93%,54%)]" />
                  )}
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-sidebar-foreground/50 group-hover:bg-white/10 group-hover:text-sidebar-foreground/80",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/40" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function UserSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="border-t border-white/10 p-3">
      <div className="rounded-lg bg-white/8 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(30,93%,54%)] to-[hsl(3,79%,54%)] text-sm font-bold text-white shadow-md">
            {user.fullName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">
              {user.fullName}
            </div>
            <div className="mt-1">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition-all hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[hsl(215,50%,18%)] to-[hsl(215,50%,13%)]">
      <div className="flex h-16 items-center px-5">
        <Logo variant="light" />
      </div>
      <div className="mt-4 flex-1 overflow-y-auto">
        <NavList onNavigate={onNavigate} />
      </div>
      <UserSection />
    </div>
  );
}

export function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 md:block">
        <div className="fixed left-0 top-0 h-screen w-[260px]">
          <SidebarInner />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/90 px-4 shadow-sm backdrop-blur-lg md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu principal</SheetTitle>
              </SheetHeader>
              <SidebarInner onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Logo compact size="sm" />
        </header>

        <main className="min-w-0 flex-1 animate-fade-in p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
