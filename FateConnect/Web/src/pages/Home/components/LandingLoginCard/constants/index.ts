import { BANNED_ACCOUNT_MESSAGE } from '@app/constants/bannedAccount';

export const LOGIN_CARD_TITLE = 'Acesse sua conta';
export const EMAIL_LABEL = 'E-mail';
export const PASSWORD_LABEL = 'Senha';
export const SUBMIT_LABEL = 'Entrar';
export const FORGOT_PASSWORD_LINK_LABEL = 'Esqueci minha senha';

export const LOGIN_ERROR_MESSAGES = {
  invalidCredentials: 'E-mail ou senha inválidos.',
  bannedAccount: BANNED_ACCOUNT_MESSAGE,
  generic: 'Erro ao realizar login. Tente novamente.',
};
