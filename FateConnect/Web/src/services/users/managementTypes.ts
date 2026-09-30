import type { ProfileTypeEnum } from '../auth/types';
import type { PageQuery } from '../types';
import type { AccountStatusEnum } from './types';

export type UserSummary = {
  id: number;
  fullName: string;
  contactEmail: string;
  phone: string | null;
  thumbnailUrl: string | null;
  status: AccountStatusEnum;
};

export interface UserFilter extends PageQuery {
  search?: string;
  status?: AccountStatusEnum;
  profileType?: ProfileTypeEnum;
}

export type UserUpdateInput = {
  fullName: string;
  fatecEmail: string;
  phone: string;
  contactEmail: string;
};
