import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/core/auth/AuthContext";
import { ProtectedRoute } from "@/core/auth/ProtectedRoute";
import { AppLayout } from "@/core/layout/AppLayout";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import ProductsListPage from "@/features/products/ProductsListPage";
import ProductDetailPage from "@/features/products/ProductDetailPage";
import ProductFormPage from "@/features/products/ProductFormPage";
import ProductImportPage from "@/features/products/ProductImportPage";
import CategoriesPage from "@/features/categories/CategoriesPage";
import AuditLogsPage from "@/features/audit-logs/AuditLogsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected app */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<ProductsListPage />} />
              <Route path="/products/import" element={
                <ProtectedRoute roles={["Admin"]}><ProductImportPage /></ProtectedRoute>
              } />
              <Route path="/products/new" element={
                <ProtectedRoute roles={["Admin", "Manager"]}><ProductFormPage mode="create" /></ProtectedRoute>
              } />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products/:id/edit" element={
                <ProtectedRoute roles={["Admin", "Manager"]}><ProductFormPage mode="edit" /></ProtectedRoute>
              } />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/audit-logs" element={
                <ProtectedRoute roles={["Admin"]}><AuditLogsPage /></ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
