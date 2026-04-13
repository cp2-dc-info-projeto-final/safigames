import api from './api';
import type { ApiResponse } from './api';
import type { User } from './models/User';

export interface LoginCredentials {
  login: string;
  password: string;
}

export type LoginResponse = ApiResponse<{ token: string }>;

export type { User };

// Funções para obter, criar ou limpar o token de autenticação
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('auth_token');
  }
  return null;
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('auth_token', token);
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auth_token');
  }
}

// Função de login, obtendo token do backend
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await api.post('/users/login', credentials);

    const body = response.data as LoginResponse;

    if (body.success && body.data?.token) {
      setToken(body.data.token);
      return body;
    }

    if (body.success) {
      return {
        success: false,
        message: 'Token não retornado na autenticação',
        errors: []
      };
    }

    return body;
  } catch (error) {
    console.error('Erro no login:', error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return { success: false, message: 'Erro de conexão com o servidor', errors: [] };
    }
    
    const body = (error as any)?.response?.data as LoginResponse | undefined;
    if (body) {
      return body;
    }
    
    return { success: false, message: 'Erro ao tentar autenticar', errors: [] };
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getToken();
    if (token) {
      // Tenta fazer logout no servidor, mas não falha se não der certo
      try {
        await api.post('/users/logout');
      } catch (logoutError) {
        console.warn('Logout no servidor falhou, removendo token localmente:', logoutError);
      }
    }
  } catch (error) {
    console.error('Erro no logout:', error);
  } finally {
    removeToken();
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // O interceptor já adiciona o token automaticamente se existir
    const response = await api.get('/users/me');
    const body = response.data as ApiResponse<User>;

    if (body.success) {
      return body.data ?? null;
    }

    removeToken();
    return null;
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
    // Só remove token se for erro 401 (não autorizado)
    if ((error as any)?.response?.status === 401) {
      removeToken();
    }
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
