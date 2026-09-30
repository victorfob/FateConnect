import type { SelectOption } from '@design-system';

import { ProfileTypeEnum } from '@app/services/auth/types';

const PROFILE_LABEL: Readonly<Record<ProfileTypeEnum, string>> = {
  [ProfileTypeEnum.OPERATOR]: 'Operador',
  [ProfileTypeEnum.ADMINISTRATOR]: 'Administrador',
};

const PROFILE_SLUG: Readonly<Record<ProfileTypeEnum, string>> = {
  [ProfileTypeEnum.OPERATOR]: 'operador',
  [ProfileTypeEnum.ADMINISTRATOR]: 'administrador',
};

const PROFILE_VALUES: ReadonlySet<string> = new Set(Object.values(ProfileTypeEnum));

export const PROFILE_TYPE_OPTIONS: readonly SelectOption[] = Object.values(ProfileTypeEnum).map(
  (profile) => ({ value: profile, label: PROFILE_LABEL[profile] }),
);

export function isProfileType(value: string): value is ProfileTypeEnum {
  return PROFILE_VALUES.has(value);
}

export function profileTypeSlug(value: ProfileTypeEnum): string {
  return PROFILE_SLUG[value];
}

export function parseProfileType(raw: string | null | undefined): ProfileTypeEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(ProfileTypeEnum).find((profile) => PROFILE_SLUG[profile] === slug);

  return found ?? null;
}
