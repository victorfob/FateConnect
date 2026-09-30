import type { SelectOption, StatusTagTone } from '@design-system';

import { AccountStatusEnum } from '@app/services/users/types';

/** A etiqueta fala da conta, então os rótulos concordam com ela no feminino. */
const STATUS_LABEL: Readonly<Record<AccountStatusEnum, string>> = {
  [AccountStatusEnum.ACTIVE]: 'Ativa',
  [AccountStatusEnum.SELF_DEACTIVATED]: 'Desativada',
  [AccountStatusEnum.BANNED]: 'Banida',
};

/** O que vai para a URL: o rótulo sem acento, porque a barra de endereço se lê. */
const STATUS_SLUG: Readonly<Record<AccountStatusEnum, string>> = {
  [AccountStatusEnum.ACTIVE]: 'ativa',
  [AccountStatusEnum.SELF_DEACTIVATED]: 'desativada',
  [AccountStatusEnum.BANNED]: 'banida',
};

const STATUS_TONE: Readonly<Record<AccountStatusEnum, StatusTagTone>> = {
  [AccountStatusEnum.ACTIVE]: 'success',
  [AccountStatusEnum.SELF_DEACTIVATED]: 'muted',
  [AccountStatusEnum.BANNED]: 'danger',
};

const STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(AccountStatusEnum));

const UNKNOWN_LABEL = '—';

export const ACCOUNT_STATUS_OPTIONS: readonly SelectOption[] = Object.values(AccountStatusEnum).map(
  (status) => ({ value: status, label: STATUS_LABEL[status] }),
);

export function isAccountStatus(value: string): value is AccountStatusEnum {
  return STATUS_VALUES.has(value);
}

export function accountStatusSlug(value: AccountStatusEnum): string {
  return STATUS_SLUG[value];
}

export function parseAccountStatus(raw: string | null | undefined): AccountStatusEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(AccountStatusEnum).find((status) => STATUS_SLUG[status] === slug);

  return found ?? null;
}

export function accountStatusLabel(value: string): string {
  if (!isAccountStatus(value)) return UNKNOWN_LABEL;

  return STATUS_LABEL[value];
}

export function accountStatusTone(value: string): StatusTagTone {
  if (!isAccountStatus(value)) return 'neutral';

  return STATUS_TONE[value];
}
