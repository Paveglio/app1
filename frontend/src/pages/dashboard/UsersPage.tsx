import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import {
  createUsuario,
  deleteUsuario,
  getTiposUsuario,
  getUsuarios,
  updateUsuario,
  type CreateUsuarioPayload,
  type TipoUsuario,
  type Usuario,
} from "@/lib/api";

const formatCpf = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const passwordRule = /^(?=.*[A-Z]).{8,}$/;

const isValidCpf = (value: string): boolean => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  if (firstDigit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;
  return secondDigit === Number(cpf[10]);
};

type FormMode = "create" | "edit";
type ViewMode = "incluir" | "consultar";

const emptyForm: CreateUsuarioPayload = {
  CPF: "",
  NOME: "",
  EMAIL: "",
  SENHA: "",
  TIPO_USER: "2",
};

type UsersPageProps = {
  initialView?: ViewMode;
};

const UsersPage = ({ initialView = "incluir" }: UsersPageProps) => {
  const { toast } = useToast();
  const { token } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [tiposUsuario, setTiposUsuario] = useState<TipoUsuario[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const [mode, setMode] = useState<FormMode>("create");
  const [editingCpf, setEditingCpf] = useState<string>("");
  const [form, setForm] = useState<CreateUsuarioPayload>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<{ CPF?: string; SENHA?: string }>({});

  const loadUsuarios = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getUsuarios(token);
      setUsuarios(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar usuarios",
        description: error instanceof Error ? error.message : "Falha ao buscar usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode !== "consultar") return;
    void loadUsuarios();
  }, [token, viewMode]);

  useEffect(() => {
    const loadTipos = async () => {
      if (!token || viewMode !== "incluir") return;
      try {
        setLoadingTipos(true);
        const tipos = await getTiposUsuario(token);
        setTiposUsuario(tipos);
      } catch (error) {
        toast({
          title: "Erro ao carregar tipos de usuario",
          description: error instanceof Error ? error.message : "Falha ao buscar tipos",
          variant: "destructive",
        });
      } finally {
        setLoadingTipos(false);
      }
    };

    void loadTipos();
  }, [token, viewMode, toast]);

  useEffect(() => {
    setViewMode(initialView);
    if (initialView === "consultar" && mode === "edit") {
      setMode("create");
      setEditingCpf("");
      setForm(emptyForm);
    }
  }, [initialView]);

  const tipoDescByCode = useMemo(() => {
    return tiposUsuario.reduce<Record<string, string>>((acc, item) => {
      acc[item.COD_TIPO] = item.DESC_TIPO;
      return acc;
    }, {});
  }, [tiposUsuario]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    const numericTerm = onlyDigits(term);

    return usuarios.filter((u) => {
      const cpfMatches = numericTerm.length > 0 ? u.CPF.includes(numericTerm) : false;
      const nomeWords = u.NOME.toLowerCase().split(/\s+/).filter(Boolean);
      const nomeMatches = nomeWords.some((word) => word.startsWith(term));
      const emailLower = u.EMAIL.toLowerCase();
      const emailUser = emailLower.split("@")[0] || "";
      const emailMatches = emailUser.startsWith(term) || emailLower.startsWith(term);
      const matchesText =
        !term ||
        nomeMatches ||
        emailMatches ||
        cpfMatches;

      const matchesTipo = tipoFilter === "todos" || u.TIPO_USER === tipoFilter;
      return matchesText && matchesTipo;
    });
  }, [usuarios, search, tipoFilter, tipoDescByCode]);

  const resetForm = () => {
    setMode("create");
    setEditingCpf("");
    setForm(emptyForm);
    setFieldErrors({});
  };

  const validateCpfField = (cpfValue: string): string | undefined => {
    if (mode !== "create") return undefined;
    if (!cpfValue) return "CPF obrigatorio";
    return isValidCpf(cpfValue) ? undefined : "CPF invalido";
  };

  const validateSenhaField = (senhaValue: string): string | undefined => {
    if (!senhaValue && mode === "edit") return undefined;
    if (passwordRule.test(senhaValue)) return undefined;
    return "Senha deve ter 8+ caracteres e 1 letra maiuscula";
  };

  const validateForm = (): string | null => {
    const cpfError = validateCpfField(form.CPF);
    if (cpfError) return cpfError;
    if (!form.NOME || form.NOME.trim().length < 2) return "Nome deve ter ao menos 2 caracteres";
    if (!form.EMAIL || !form.EMAIL.includes("@")) return "Email invalido";
    const senhaError = validateSenhaField(form.SENHA);
    if (senhaError) return senhaError;
    if (!form.TIPO_USER || form.TIPO_USER.length > 2) return "Tipo de usuario invalido";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validacao",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      if (mode === "create") {
        await createUsuario(
          {
            ...form,
            CPF: onlyDigits(form.CPF),
            NOME: form.NOME.trim(),
            EMAIL: form.EMAIL.trim(),
          },
          token,
        );
        toast({ title: "Usuario criado com sucesso" });
      } else {
        await updateUsuario(
          editingCpf,
          {
            NOME: form.NOME.trim(),
            EMAIL: form.EMAIL.trim(),
            TIPO_USER: form.TIPO_USER,
            ...(form.SENHA ? { SENHA: form.SENHA } : {}),
          },
          token,
        );
        toast({ title: "Usuario atualizado com sucesso" });
      }

      resetForm();
      await loadUsuarios();
    } catch (error) {
      toast({
        title: mode === "create" ? "Erro ao criar usuario" : "Erro ao atualizar usuario",
        description: error instanceof Error ? error.message : "Operacao falhou",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setViewMode("incluir");
    setMode("edit");
    setEditingCpf(usuario.CPF);
    setForm({
      CPF: formatCpf(usuario.CPF),
      NOME: usuario.NOME,
      EMAIL: usuario.EMAIL,
      SENHA: "",
      TIPO_USER: usuario.TIPO_USER,
    });
  };

  const handleDelete = async (cpf: string) => {
    if (!token) return;
    const confirmed = window.confirm(`Deseja excluir o usuario CPF ${formatCpf(cpf)}?`);
    if (!confirmed) return;

    try {
      await deleteUsuario(cpf, token);
      toast({ title: "Usuario excluido com sucesso" });
      if (editingCpf === cpf) resetForm();
      await loadUsuarios();
    } catch (error) {
      toast({
        title: "Erro ao excluir usuario",
        description: error instanceof Error ? error.message : "Falha ao excluir",
        variant: "destructive",
      });
    }
  };

  const cpfLiveError = validateCpfField(form.CPF);
  const senhaLiveError = validateSenhaField(form.SENHA);
  const disableSubmit = saving || Boolean(cpfLiveError || senhaLiveError || fieldErrors.CPF || fieldErrors.SENHA);

  return (
    <div className="space-y-6">
      {viewMode === "incluir" && (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {mode === "create" ? "Cadastro de Usuario" : `Editando Usuario ${formatCpf(editingCpf)}`}
            </h2>
            {mode === "edit" && (
              <Button variant="outline" onClick={resetForm}>
                Cancelar Edicao
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">CPF</label>
              <Input
                placeholder="000.000.000-00"
                value={form.CPF}
                maxLength={14}
                disabled={mode === "edit"}
                className={fieldErrors.CPF ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={(e) => {
                  const nextCpf = formatCpf(e.target.value);
                  setForm((prev) => ({ ...prev, CPF: nextCpf }));
                  setFieldErrors((prev) => ({ ...prev, CPF: validateCpfField(nextCpf) }));
                }}
              />
              {fieldErrors.CPF && <p className="mt-1 text-xs text-destructive">{fieldErrors.CPF}</p>}
            </div>

            <div className="md:col-span-6">
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <Input
                placeholder="Nome completo"
                value={form.NOME}
                onChange={(e) => setForm((prev) => ({ ...prev, NOME: e.target.value }))}
              />
            </div>

            <div className="md:col-span-4">
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                placeholder="email@dominio.com"
                type="email"
                value={form.EMAIL}
                onChange={(e) => setForm((prev) => ({ ...prev, EMAIL: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                {mode === "create" ? "Senha" : "Nova senha"}
              </label>
              <Input
                placeholder={mode === "create" ? "Senha" : "Opcional na edicao"}
                type="password"
                value={form.SENHA}
                className={fieldErrors.SENHA ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={(e) => {
                  const nextSenha = e.target.value;
                  setForm((prev) => ({ ...prev, SENHA: nextSenha }));
                  setFieldErrors((prev) => ({ ...prev, SENHA: validateSenhaField(nextSenha) }));
                }}
              />
              {fieldErrors.SENHA && <p className="mt-1 text-xs text-destructive">{fieldErrors.SENHA}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Tipo de usuario</label>
              <Select
                value={form.TIPO_USER}
                disabled={loadingTipos || !tiposUsuario.length}
                onValueChange={(value) => setForm((prev) => ({ ...prev, TIPO_USER: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTipos ? "Carregando..." : "Selecione"} />
                </SelectTrigger>
                <SelectContent>
                  {tiposUsuario.map((tipo) => (
                    <SelectItem key={tipo.COD_TIPO} value={tipo.COD_TIPO}>
                      {tipo.COD_TIPO} - {tipo.DESC_TIPO}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-12 flex justify-end">
              <Button type="submit" disabled={disableSubmit}>
                <UserPlus className="mr-2 h-4 w-4" />
                {saving ? "Salvando..." : mode === "create" ? "Cadastrar Usuario" : "Salvar Alteracoes"}
              </Button>
            </div>
          </form>
        </section>
      )}

      {viewMode === "consultar" && (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Consulta de Usuarios</h2>
              <p className="text-sm text-muted-foreground">
                {loading ? "Carregando registros..." : `${filteredUsers.length} usuario(s) encontrado(s)`}
              </p>
            </div>
            <div className="grid w-full gap-3 md:max-w-2xl md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Buscar</label>
                <Input
                  placeholder="Nome, email ou CPF"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tipo de usuario</label>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {tiposUsuario.map((tipo) => (
                      <SelectItem key={tipo.COD_TIPO} value={tipo.COD_TIPO}>
                        {tipo.DESC_TIPO}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            {loading ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                Carregando usuarios...
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>CPF</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((usuario) => (
                    <TableRow key={usuario.CPF} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{formatCpf(usuario.CPF)}</TableCell>
                      <TableCell>{usuario.NOME}</TableCell>
                      <TableCell>{usuario.EMAIL}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                        {tipoDescByCode[usuario.TIPO_USER] || usuario.TIPO_USER}
                      </span>
                    </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(usuario)}>
                            <Pencil className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(usuario.CPF)}>
                            <Trash2 className="mr-1 h-3 w-3" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredUsers.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum usuario encontrado para o filtro informado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default UsersPage;
