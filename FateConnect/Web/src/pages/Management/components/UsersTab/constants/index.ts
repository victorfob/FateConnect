import { AccountStatusEnum } from '@app/services/users/types';

export const USERS_QUERY_KEY = 'management-users';

export const EMPTY_LIST_MESSAGE =
  'Nenhum usuário encontrado. Ajuste os filtros para ampliar a busca.';

export const USER_LIST_MESSAGES = {
  loadFailed: 'Erro ao carregar os usuários. Tente novamente.',
  banned: 'Conta banida.',
  banReverted: 'Banimento revertido.',
  statusFailed: 'Erro ao mudar a situação da conta. Tente novamente.',
};

/** A gestão só leva uma conta a dois lugares: banida, ou de volta à ativa. */
export function statusChangedMessage(status: AccountStatusEnum): string {
  if (status === AccountStatusEnum.BANNED) return USER_LIST_MESSAGES.banned;

  return USER_LIST_MESSAGES.banReverted;
}
