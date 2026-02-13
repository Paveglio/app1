export type UserEmpresa = {
  CNPJ: string;
  COD_PERMISSAO: string;
  USER_STATUS: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    nome: string;
    CPF: string;
    empresas: UserEmpresa[];
  };
};

export type Empresa = {
  CNPJ: string;
  IM: string | null;
  NOME: string;
  OPTANTE_SN: string;
  OPTANTE_MEI: string | null;
  AMBIENTE_INTEGRACAO_ID: number | null;
  data_upload: string | null;
};

export type Usuario = {
  CPF: string;
  NOME: string;
  EMAIL: string;
  TIPO_USER: string;
};

export type CreateUsuarioPayload = {
  CPF: string;
  NOME: string;
  EMAIL: string;
  SENHA: string;
  TIPO_USER: string;
};

export type UpdateUsuarioPayload = Partial<CreateUsuarioPayload>;

export type TipoUsuario = {
  COD_TIPO: string;
  DESC_TIPO: string;
};

type ApiError = Error & { status?: number };

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Erro ao comunicar com o servidor";
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = Array.isArray(payload.message) ? payload.message.join(", ") : payload.message;
      }
    } catch {
      // noop
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function login(CPF: string, SENHA: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ CPF, SENHA }),
  });
}

export function logout(token: string): Promise<{ message: string }> {
  return request<{ message: string }>(
    "/auth/logout",
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    token,
  );
}

export function getEmpresa(cnpj: string, token: string): Promise<Empresa> {
  return request<Empresa>(`/empresa/${cnpj}`, { method: "GET" }, token);
}

export function getUsuarios(token: string): Promise<Usuario[]> {
  return request<Usuario[]>("/user", { method: "GET" }, token);
}

export function createUsuario(payload: CreateUsuarioPayload, token: string): Promise<Usuario> {
  return request<Usuario>(
    "/user",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function updateUsuario(cpf: string, payload: UpdateUsuarioPayload, token: string): Promise<Usuario> {
  return request<Usuario>(
    `/user/${cpf}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function deleteUsuario(cpf: string, token: string): Promise<void> {
  return request<void>(`/user/${cpf}`, { method: "DELETE" }, token);
}

export function getTiposUsuario(token: string): Promise<TipoUsuario[]> {
  return request<TipoUsuario[]>("/tipo-user", { method: "GET" }, token);
}
