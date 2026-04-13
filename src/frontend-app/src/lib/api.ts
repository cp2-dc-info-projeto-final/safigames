import axios, { type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { removeToken } from './auth';

export interface ApiFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors: ApiFieldError[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

// Cria uma instância global do axios para API backend na porta 3000
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Útil para CORS com cookies/sessão
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar automaticamente o token Bearer
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas 401 (token expirado)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token inválido ou expirado, remover usando função centralizada
      removeToken();
      // Redirecionar para login se não estiver na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
