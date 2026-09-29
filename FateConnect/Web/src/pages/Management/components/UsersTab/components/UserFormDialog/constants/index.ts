import { SignupConflictFieldEnum } from '@app/pages/Signup/@types';
import { SIGNUP_CONFLICT_MESSAGES, SIGNUP_ERROR_MESSAGES } from '@app/pages/Signup/constants';

export const USER_QUERY_KEY = 'management-user';

export const EDIT_TITLE = 'Editar usuário';
export const SUBMIT_LABEL = 'Salvar alterações';
export const PROFILE_TYPE_LABEL = 'Perfil';

export const USER_FORM_MESSAGES = {
  loadFailed: 'Erro ao carregar o usuário. Tente novamente.',
  updated: 'Usuário atualizado.',
  invalidData: SIGNUP_ERROR_MESSAGES.invalidData,
  failed: 'Erro ao atualizar o usuário. Tente novamente.',
};

/** O do cadastro manda entrar com o e-mail repetido, o que aqui não faz sentido. */
export const USER_CONFLICT_MESSAGES: Readonly<Record<SignupConflictFieldEnum, string>> = {
  ...SIGNUP_CONFLICT_MESSAGES,
  [SignupConflictFieldEnum.FATEC_EMAIL]: 'E-mail Fatec já cadastrado',
};
