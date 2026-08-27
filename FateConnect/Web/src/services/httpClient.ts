import axios, { type AxiosInstance } from 'axios';

import { notifySessionExpired } from './auth/sessionExpiry';
import { tokenStorage } from './auth/tokenStorage';

/**
 * Erro já normalizado para a camada de UI. É classe, e não objeto solto, porque
 * rejeitar promessa com literal descarta a pilha e faz `instanceof` mentir.
 */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar ao servidor. Tente novamente.';
export const GENERIC_ERROR_MESSAGE = 'Algo deu errado. Tente novamente.';
export const SESSION_EXPIRED_MESSAGE = 'Sessão expirada. Entre novamente para continuar.';

const UNAUTHORIZED = 401;

function withInterceptors(client: AxiosInstance): AxiosInstance {
  client.interceptors.request.use((config) => {
    const token = tokenStorage.getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(new ApiError(GENERIC_ERROR_MESSAGE));
      }

      if (!error.response) {
        return Promise.reject(new ApiError(NETWORK_ERROR_MESSAGE));
      }

      // Só é expiração quando havia sessão: o interceptor acima só manda
      // `Authorization` se houver token, então `401` sem token é credencial
      // recusada — o que o login devolve a quem erra a senha.
      if (error.response.status === UNAUTHORIZED && tokenStorage.getToken()) {
        // Limpar antes de avisar encerra o laço: as requisições que falharem em
        // seguida já não levam token, então não voltam por este caminho.
        tokenStorage.clear();
        notifySessionExpired();

        return Promise.reject(new ApiError(SESSION_EXPIRED_MESSAGE, error.response.status));
      }

      return Promise.reject(new ApiError(GENERIC_ERROR_MESSAGE, error.response.status));
    },
  );

  return client;
}

/** API principal — autenticação e cadastro. */
export const apiClient = withInterceptors(axios.create({ baseURL: import.meta.env.VITE_API_URL }));

/** API de caronas, que tem endereço próprio. */
export const rideApiClient = withInterceptors(
  axios.create({ baseURL: import.meta.env.VITE_RIDE_API_URL }),
);
