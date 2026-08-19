import axios, { type AxiosInstance } from 'axios';

import { tokenStorage } from './auth/tokenStorage';

/** Erro já normalizado para a camada de UI. */
export type ApiError = {
  status?: number;
  message: string;
};

export const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar ao servidor. Tente novamente.';
export const GENERIC_ERROR_MESSAGE = 'Algo deu errado. Tente novamente.';

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
        return Promise.reject<ApiError>({ message: GENERIC_ERROR_MESSAGE });
      }

      if (!error.response) {
        return Promise.reject<ApiError>({ message: NETWORK_ERROR_MESSAGE });
      }

      return Promise.reject<ApiError>({
        status: error.response.status,
        message: GENERIC_ERROR_MESSAGE,
      });
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
