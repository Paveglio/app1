import { User, ChevronDown, LogOut, Building2 } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { user, loginAt, selectedEmpresa, clearSelectedEmpresa, signOut } = useAuth();

  const loginTime = useMemo(() => {
    if (!loginAt) {
      return "-";
    }
    const date = new Date(loginAt);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }, [loginAt]);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <span className="font-display text-lg font-bold text-foreground">
          MP <span className="text-gradient">DEV</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex flex-col items-end leading-tight px-2">
          <span className="text-sm font-medium text-foreground">{user?.nome || "Usuario"}</span>
          <span className="text-xs text-muted-foreground">{selectedEmpresa?.NOME || "Empresa nao selecionada"}</span>
          <span className="text-xs text-muted-foreground">Login: {loginTime}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full bg-accent/10 text-accent hover:bg-accent/20 px-2">
              <User size={18} />
              <ChevronDown size={16} className="ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.nome || "Usuario"}</DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-0">
              Empresa: {selectedEmpresa?.NOME || "Nao selecionada"}
            </DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-0">
              Login: {loginTime}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                clearSelectedEmpresa();
                navigate("/empresas");
              }}
            >
              <Building2 size={16} className="mr-2" />
              Trocar Empresa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="text-destructive"
            >
              <LogOut size={16} className="mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
