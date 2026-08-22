import type { SelectOption } from '@design-system';

import { GenderValueEnum } from '../@types';

export const SIGNUP_TITLE = 'Crie sua Conta';
export const ADDRESS_SECTION_TITLE = 'Endereço';
export const CONTACT_SECTION_TITLE = 'Dados para contato';

export const FIELD_LABELS = {
  fullName: 'Nome completo',
  nickname: 'Apelido',
  fatecEmail: 'E-mail Fatec',
  birthDate: 'Data de nascimento',
  gender: 'Gênero',
  password: 'Senha',
  zipCode: 'CEP',
  state: 'Estado',
  city: 'Cidade',
  street: 'Logradouro',
  streetNumber: 'Número',
  complement: 'Complemento',
  phone: 'Telefone',
  contactEmail: 'E-mail para contato',
};

export const FIELD_PLACEHOLDERS = {
  fatecEmail: 'nome.sobrenome@aluno.cps.sp.gov.br',
  birthDate: 'dd/mm/aaaa',
  zipCode: '00000-000',
  phone: '(00) 00000-0000',
};

export const SELECT_PLACEHOLDER = 'Selecione...';
export const PASSWORD_TOGGLE_LABEL = 'Mostrar ou ocultar senha';
export const CALENDAR_TOGGLE_LABEL = 'Abrir calendário';
export const ZIP_LOOKUP_LABEL = 'Consultando CEP';

export const CONSENT_TERMS_PREFIX = 'Eu concordo com os';
export const CONSENT_TERMS_LINK = 'Termos de Uso';
export const CONSENT_TERMS_SEPARATOR = 'e';
export const CONSENT_PRIVACY_LINK = 'Política de Privacidade';
export const CONSENT_MARKETING_LABEL =
  'Eu concordo em receber e-mails e notificações do aplicativo';

export const SUBMIT_LABEL = 'Cadastrar';
export const LOGIN_PROMPT = 'Já tem uma conta?';
export const LOGIN_LINK_LABEL = 'Faça login';

export const LEGAL_SOON_MESSAGES = {
  terms: 'Termos de uso estarão disponíveis em breve.',
  privacy: 'Política de privacidade estará disponível em breve.',
};

export const SIGNUP_ERROR_MESSAGES = {
  emailTaken: 'Este e-mail já está em uso.',
  invalidData: 'Dados inválidos. Verifique os campos preenchidos.',
  generic: 'Erro ao realizar cadastro. Tente novamente.',
};

export const ZIP_LOOKUP_MESSAGES = {
  notFound: 'CEP não encontrado.',
  failed: 'Não foi possível consultar o CEP. Tente novamente.',
};

export const signupSuccessMessage = (fullName: string): string =>
  `Conta criada com sucesso, ${fullName}!`;

export const GENDER_OPTIONS: readonly SelectOption[] = [
  { value: GenderValueEnum.MALE, label: 'Masculino' },
  { value: GenderValueEnum.FEMALE, label: 'Feminino' },
  { value: GenderValueEnum.UNDISCLOSED, label: 'Prefiro não informar' },
];

/** Unidades federativas (sigla + nome em pt-BR). */
export const BRAZILIAN_STATES: readonly SelectOption[] = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

/** As escolhas que o campo oferece, já com a opção vazia na frente. */
export const GENDER_SELECT_OPTIONS: readonly SelectOption[] = [
  { value: '', label: SELECT_PLACEHOLDER },
  ...GENDER_OPTIONS,
];

export const STATE_SELECT_OPTIONS: readonly SelectOption[] = [
  { value: '', label: SELECT_PLACEHOLDER },
  ...BRAZILIAN_STATES,
];
