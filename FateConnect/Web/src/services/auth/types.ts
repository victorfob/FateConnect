export type LoginRequest = {
  fatecEmail: string;
  password: string;
};

export type TokenResponse = {
  token: string;
  fullName: string;
};
