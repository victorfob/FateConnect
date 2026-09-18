import { ManagementTabEnum } from '@app/pages/Management/types';

export const TAB_PARAM = 'aba';

const TAB_VALUES: ReadonlySet<string> = new Set(Object.values(ManagementTabEnum));

export function isManagementTab(value: string): value is ManagementTabEnum {
  return TAB_VALUES.has(value);
}

/** Endereço sem aba abre na primeira, que é a de usuários. */
export function parseManagementTab(raw: string | null | undefined): ManagementTabEnum {
  const value = raw?.trim().toLowerCase();
  if (value && isManagementTab(value)) return value;

  return ManagementTabEnum.USERS;
}
