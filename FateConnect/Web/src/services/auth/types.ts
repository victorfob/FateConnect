/** Corpo esperado pelo endpoint de login (contrato do backend, em pt-BR). */
export type LoginRequest = {
  emailFatec: string;
  senha: string;
};

export type TokenResponse = {
  token: string;
  nomeCompleto: string;
};
