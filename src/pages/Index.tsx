import { Navigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";

// Root-level redirect: send to /products if logged in, else /login.
export default function Index() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/products" : "/login"} replace />;
}
