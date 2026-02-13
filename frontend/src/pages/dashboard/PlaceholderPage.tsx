import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const titles: Record<string, string> = {
  "/dashboard/notas": "Emissão de Notas",
  "/dashboard/clientes": "Clientes",
  "/dashboard/servicos": "Serviços",
  "/dashboard/comercio": "Comércio",
  "/dashboard/financeiro": "Financeiro",
  "/dashboard/empresas": "Empresas",
  "/dashboard/usuarios": "Usuários",
  "/dashboard/configuracoes": "Configurações",
};

const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] || "Página";

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
        <Construction size={32} className="text-accent" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        Esta funcionalidade está em desenvolvimento e estará disponível em breve.
      </p>
    </div>
  );
};

export default PlaceholderPage;
