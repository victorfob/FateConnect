/** Contratos do endpoint de cadastro (nomes vindos do backend, em pt-BR). */
export type SignupAddress = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
};

export type SignupContact = {
  telefone: string;
  emailContato: string;
};

export type SignupRequest = {
  emailFatec: string;
  senha: string;
  nomeCompleto: string;
  apelido?: string;
  dataNascimento: string;
  genero: number;
  enderecos: SignupAddress[];
  contatos: SignupContact[];
};

export type SignupResponse = {
  id: number;
  emailFatec: string;
  nomeCompleto: string;
};
