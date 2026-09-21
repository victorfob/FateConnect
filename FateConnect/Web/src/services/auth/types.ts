export type LoginRequest = {
  fatecEmail: string;
  password: string;
};

export type TokenResponse = {
  token: string;
};

/** Os nomes que a API escreve na claim, que são os do enum de perfil dela. */
export enum ProfileTypeEnum {
  OPERATOR = 'Operator',
  ADMINISTRATOR = 'Administrator',
}
