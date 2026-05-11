export interface Contact {
  telefone: string;
  emailContato: string;
}

export interface Adress {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
}

export interface User {
  emailFatec: string;
  senha: string;
  nomeCompleto: string;
  apelido?: string;
  dataNascimento: string;
  genero: number;
  enderecos: Adress[];
  contatos: Contact[];
}

export interface UserResponse {
  id: number;
  emailFatec: string;
  nomeCompleto: string;
}
