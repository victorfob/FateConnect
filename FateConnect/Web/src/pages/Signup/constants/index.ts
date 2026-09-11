import { SignupConflictFieldEnum } from '../@types';

export const SIGNUP_TITLE = 'Criar conta';
export const CONTACT_SECTION_TITLE = 'Dados para contato';

export const FIELD_LABELS = {
  fullName: 'Nome completo',
  fatecEmail: 'E-mail Fatec',
  birthDate: 'Data de nascimento',
  gender: 'Gênero',
  password: 'Senha',
  phone: 'Telefone',
  contactEmail: 'E-mail para contato',
};

export const FIELD_PLACEHOLDERS = {
  fatecEmail: 'nome.sobrenome@aluno.cps.sp.gov.br',
  birthDate: 'dd/mm/aaaa',
  phone: '(00) 00000-0000',
};

export const SUBMIT_LABEL = 'Criar conta';
export const LOGIN_PROMPT = 'Já tem conta?';
export const LOGIN_LINK_LABEL = 'Entrar';

export const SIGNUP_ERROR_MESSAGES = {
  emailTaken: 'Este e-mail já está em uso. Entre com ele ou use outro endereço.',
  invalidData: 'Dados inválidos. Verifique os campos preenchidos.',
  generic: 'Erro ao realizar cadastro. Tente novamente.',
};

export const SIGNUP_CONFLICT_MESSAGES: Record<SignupConflictFieldEnum, string> = {
  [SignupConflictFieldEnum.FATEC_EMAIL]: 'E-mail já cadastrado — entre com ele',
  [SignupConflictFieldEnum.PHONE]: 'Telefone já cadastrado',
  [SignupConflictFieldEnum.CONTACT_EMAIL]: 'E-mail já cadastrado',
};

export const SIGNUP_SUCCESS_MESSAGE = 'Conta criada.';
