import type { ProfileTypeEnum } from '../auth/types';

/** Os nomes que o enum de situação da API serializa. */
export enum AccountStatusEnum {
  ACTIVE = 'Active',
  SELF_DEACTIVATED = 'SelfDeactivated',
  BANNED = 'Banned',
}

export type User = {
  id: number;
  fatecEmail: string;
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string;
  contactEmail: string;
  neighborhood: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  profileType: ProfileTypeEnum;
  status: AccountStatusEnum;
  createdAt: string;
};
