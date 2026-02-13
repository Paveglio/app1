import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmpresa, type Empresa } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

const formatCnpj = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

const SelectCnpj = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token, setSelectedEmpresa, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedCnpj, setSelectedCnpj] = useState<string>("");

  useEffect(() => {
    const loadEmpresas = async () => {
      if (!token || !user) {
        return;
      }

      const permittedEmpresas = user.empresas.filter((item) => item.USER_STATUS?.trim() === "1");
      if (!permittedEmpresas.length) {
        setLoading(false);
        toast({
          title: "Acesso sem empresa",
          description: "Nenhum CNPJ ativo foi encontrado para o seu CPF.",
          variant: "destructive",
        });
        return;
      }

      try {
        const results = await Promise.allSettled(
          permittedEmpresas.map((item) => getEmpresa(item.CNPJ, token)),
        );
        const success = results
          .filter((result): result is PromiseFulfilledResult<Empresa> => result.status === "fulfilled")
          .map((result) => result.value);

        setEmpresas(success);
      } catch {
        toast({
          title: "Erro ao carregar CNPJs",
          description: "Nao foi possivel buscar as empresas do usuario.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadEmpresas();
  }, [token, user, toast]);

  const handleContinue = () => {
    const empresa = empresas.find((item) => item.CNPJ === selectedCnpj);
    if (!empresa) {
      return;
    }
    setSaving(true);
    setSelectedEmpresa(empresa);
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen hero-gradient px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Selecione o CNPJ</h1>
            <p className="text-muted-foreground">Escolha a empresa para entrar no dashboard.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Empresas vinculadas</CardTitle>
            <CardDescription>
              {user?.nome ? `Usuario: ${user.nome}` : "Selecione uma empresa para continuar"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Carregando empresas...</p>}
            {!loading && empresas.length === 0 && (
              <p className="text-sm text-destructive">Nenhum CNPJ disponivel para este usuario.</p>
            )}

            {empresas.map((empresa) => {
              const selected = selectedCnpj === empresa.CNPJ;
              return (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  key={empresa.CNPJ}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selected ? "border-accent bg-accent/10" : "border-border bg-background"
                  }`}
                  onClick={() => setSelectedCnpj(empresa.CNPJ)}
                >
                  <div className="mb-1 flex items-center gap-2 font-semibold">
                    <Building2 className="h-4 w-4" />
                    {empresa.NOME}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatCnpj(empresa.CNPJ)}</p>
                </motion.button>
              );
            })}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!selectedCnpj || saving}
            className="accent-gradient border-0 text-accent-foreground"
          >
            {saving ? "Entrando..." : "Ir para o dashboard"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectCnpj;
