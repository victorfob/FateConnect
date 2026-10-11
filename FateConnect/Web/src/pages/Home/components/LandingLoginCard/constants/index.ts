import { BANNED_ACCOUNT_MESSAGE } from '@app/constants/bannedAccount';

export const LOGIN_CARD_TITLE = 'Acesse sua conta';
export const EMAIL_LABEL = 'E-mail';
export const PASSWORD_LABEL = 'Senha';
export const SUBMIT_LABEL = 'Entrar';
export const SIGNUP_PROMPT = 'Não tem conta?';
export const SIGNUP_LINK_LABEL = 'Criar conta';

export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: 'E-mail ou senha inválidos.',
  bannedAccount: BANNED_ACCOUNT_MESSAGE,
  generic: 'Erro ao realizar login. Tente novamente.',
};
