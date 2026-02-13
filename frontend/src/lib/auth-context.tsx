import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Empresa, LoginResponse, login as apiLogin, logout as apiLogout } from "@/lib/api";

type AuthState = {
  token: string | null;
  user: LoginResponse["user"] | null;
  selectedEmpresa: Empresa | null;
  loginAt: string | null;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  signIn: (cpf: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSelectedEmpresa: (empresa: Empresa) => void;
  clearSelectedEmpresa: () => void;
};

const STORAGE_KEY = "nf_auth_state";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadAuthState(): AuthState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { token: null, user: null, selectedEmpresa: null, loginAt: null };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
      selectedEmpresa: parsed.selectedEmpresa ?? null,
      loginAt: parsed.loginAt ?? null,
    };
  } catch {
    return { token: null, user: null, selectedEmpresa: null, loginAt: null };
  }
}

function persistAuthState(state: AuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => loadAuthState());

  const signIn = useCallback(async (cpf: string, senha: string) => {
    const payload = await apiLogin(cpf, senha);
    const nextState: AuthState = {
      token: payload.access_token,
      user: payload.user,
      selectedEmpresa: null,
      loginAt: new Date().toISOString(),
    };

    setAuthState(nextState);
    persistAuthState(nextState);
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (authState.token) {
        await apiLogout(authState.token);
      }
    } catch {
      // Mesmo se o backend falhar no logout, limpamos a sessao local.
    }

    const nextState: AuthState = { token: null, user: null, selectedEmpresa: null, loginAt: null };
    setAuthState(nextState);
    persistAuthState(nextState);
  }, [authState.token]);

  const setSelectedEmpresa = useCallback((empresa: Empresa) => {
    const nextState: AuthState = { ...authState, selectedEmpresa: empresa };
    setAuthState(nextState);
    persistAuthState(nextState);
  }, [authState]);

  const clearSelectedEmpresa = useCallback(() => {
    const nextState: AuthState = { ...authState, selectedEmpresa: null };
    setAuthState(nextState);
    persistAuthState(nextState);
  }, [authState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      isAuthenticated: Boolean(authState.token && authState.user),
      signIn,
      signOut,
      setSelectedEmpresa,
      clearSelectedEmpresa,
    }),
    [authState, clearSelectedEmpresa, setSelectedEmpresa, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider");
  }
  return context;
}
