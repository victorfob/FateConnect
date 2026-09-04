import { PersonIcon, SettingsIcon } from '@design-system/icons';

import { RoutePathEnum } from '@app/routes/paths';

import type { AccountLink } from '../@types';

export const TRIGGER_LABEL = 'Abrir menu da conta';
export const SIGN_OUT_LABEL = 'Sair';

/** O painel não tem título visível: é por aqui que o nome da conta é anunciado. */
export function panelLabel(userName: string): string {
  return `Conta de ${userName}`;
}

export const ACCOUNT_LINKS: AccountLink[] = [
  { label: 'Meu perfil', path: RoutePathEnum.PROFILE, Icon: PersonIcon },
  { label: 'Preferências', path: RoutePathEnum.PREFERENCES, Icon: SettingsIcon },
];
