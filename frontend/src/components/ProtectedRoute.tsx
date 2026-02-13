import { Navigate } from "react-router-dom";
import { type ReactElement } from "react";
import { useAuth } from "@/lib/auth-context";

type ProtectedRouteProps = {
  children: ReactElement;
  requireEmpresa?: boolean;
};

const ProtectedRoute = ({ children, requireEmpresa = false }: ProtectedRouteProps) => {
  const { isAuthenticated, selectedEmpresa } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireEmpresa && !selectedEmpresa) {
    return <Navigate to="/empresas" replace />;
  }

  return children;
};

export default ProtectedRoute;
