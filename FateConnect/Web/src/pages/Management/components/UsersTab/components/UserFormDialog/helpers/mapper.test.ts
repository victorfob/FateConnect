import { ProfileTypeEnum } from '@app/services/auth/types';
import { AccountStatusEnum, type User } from '@app/services/users/types';

import { toFormValues, toUserUpdateInput } from './mapper';

const USER: User = {
  id: 7,
  fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
  fullName: 'Maria da Silva',
  birthDate: '2000-01-01T00:00:00',
  gender: 'Female',
  phone: null,
  contactEmail: null,
  neighborhood: null,
  imageUrl: null,
  thumbnailUrl: null,
  profileType: ProfileTypeEnum.OPERATOR,
  status: AccountStatusEnum.ACTIVE,
  createdAt: '2026-09-01T12:00:00',
};

describe('user form mapper', () => {
  it('should open an account without contact with the fields empty and optional', () => {
    expect(toFormValues(USER)).toMatchObject({
      phone: '',
      contactEmail: '',
      contactIsRequired: false,
    });
  });

  it('should require the contact of an account that has one', () => {
    const withContact = { ...USER, phone: '15999998888', contactEmail: 'maria@exemplo.test' };

    expect(toFormValues(withContact)).toMatchObject({
      phone: '(15) 99999-8888',
      contactEmail: 'maria@exemplo.test',
      contactIsRequired: true,
    });
  });

  it('should send empty contact fields as null, which the api reads as untouched', () => {
    expect(toUserUpdateInput({ ...toFormValues(USER), fullName: 'Maria Rocha' })).toEqual({
      fullName: 'Maria Rocha',
      fatecEmail: USER.fatecEmail,
      phone: null,
      contactEmail: null,
    });
  });

  it('should send the phone as digits and the email as typed', () => {
    const values = {
      ...toFormValues(USER),
      phone: '(15) 99999-8888',
      contactEmail: 'maria@exemplo.test',
    };

    expect(toUserUpdateInput(values)).toMatchObject({
      phone: '15999998888',
      contactEmail: 'maria@exemplo.test',
    });
  });
});
