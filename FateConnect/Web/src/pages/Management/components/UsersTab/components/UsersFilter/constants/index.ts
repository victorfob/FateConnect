import type { SelectOption } from '@design-system';

import { ACCOUNT_STATUS_OPTIONS } from '@app/pages/Management/components/UsersTab/helpers/accountStatus';
import { PROFILE_TYPE_OPTIONS } from '@app/pages/Management/components/UsersTab/helpers/profileType';

/** A busca casa nome, os dois e-mails e o telefone, e o rótulo promete isso. */
export const FILTER_LABELS = {
  search: 'Nome, e-mail ou telefone',
  status: 'Situação',
  profileType: 'Perfil',
};

/** Sentinela do formulário: não vai para a requisição. */
export enum UserFilterEnum {
  ALL = '',
}

export const STATUS_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: UserFilterEnum.ALL, label: 'Todas' },
  ...ACCOUNT_STATUS_OPTIONS,
];

export const PROFILE_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: UserFilterEnum.ALL, label: 'Todos' },
  ...PROFILE_TYPE_OPTIONS,
];
