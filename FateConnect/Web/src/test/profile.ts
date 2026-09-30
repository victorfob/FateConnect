import { ProfileTypeEnum } from '@app/services/auth/types';
import { AccountStatusEnum, type User } from '@app/services/users/types';

export const PROFILE: User = {
  id: 7,
  fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
  fullName: 'Maria da Silva',
  birthDate: '2001-04-18T00:00:00',
  gender: 'Female',
  phone: '15991234567',
  contactEmail: 'maria.silva@gmail.com',
  neighborhood: 'Jardim Vergueiro',
  imageUrl: null,
  thumbnailUrl: null,
  profileType: ProfileTypeEnum.OPERATOR,
  status: AccountStatusEnum.ACTIVE,
  createdAt: '2026-08-02T13:45:00',
};
