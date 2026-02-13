import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import PlaceholderPage from "./pages/dashboard/PlaceholderPage";
import UsersPage from "./pages/dashboard/UsersPage";
import NotFound from "./pages/NotFound";
import SelectCnpj from "./pages/SelectCnpj";
import { AuthProvider } from "./lib/auth-context";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/empresas"
              element={
                <ProtectedRoute>
                  <SelectCnpj />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireEmpresa>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="notas" element={<PlaceholderPage />} />
              <Route path="clientes" element={<PlaceholderPage />} />
              <Route path="servicos" element={<PlaceholderPage />} />
              <Route path="comercio" element={<PlaceholderPage />} />
              <Route path="financeiro" element={<PlaceholderPage />} />
              <Route path="empresas" element={<PlaceholderPage />} />
              <Route path="usuarios" element={<Navigate to="/dashboard/usuarios/consultar" replace />} />
              <Route path="usuarios/incluir" element={<UsersPage initialView="incluir" />} />
              <Route path="usuarios/consultar" element={<UsersPage initialView="consultar" />} />
              <Route path="configuracoes" element={<PlaceholderPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
