import { FATEC_EMAIL_DOMAIN_MESSAGE } from '@app/constants/fatecEmail';
import { ProfileTypeEnum } from '@app/services/auth/types';

import { userFormSchema, type UserFormValues } from '.';

const VALID: UserFormValues = {
  fullName: 'Maria da Silva',
  fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
  phone: '(15) 99999-8888',
  contactEmail: 'maria@exemplo.test',
  contactIsRequired: true,
  profileType: ProfileTypeEnum.OPERATOR,
};

describe('userFormSchema', () => {
  it('should accept the fields the signup accepts', () => {
    expect(userFormSchema.safeParse(VALID).success).toBe(true);
  });

  it('should refuse the institutional e-mail the signup refuses', () => {
    const result = userFormSchema.safeParse({
      ...VALID,
      fatecEmail: 'joao.silva@fatec.sp.gov.br',
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['fatecEmail']);
    expect(result.error?.issues[0]?.message).toBe(FATEC_EMAIL_DOMAIN_MESSAGE);
  });

  it('should refuse a phone without the area code', () => {
    const result = userFormSchema.safeParse({ ...VALID, phone: '99999-8888' });

    expect(result.error?.issues[0]?.path).toEqual(['phone']);
  });

  it('should refuse clearing the contact of an account that has one', () => {
    const result = userFormSchema.safeParse({ ...VALID, phone: '', contactEmail: '' });

    expect(result.error?.issues.map(({ path }) => path)).toEqual([['phone'], ['contactEmail']]);
  });

  it('should accept an account still without contact', () => {
    const withoutContact = { ...VALID, phone: '', contactEmail: '', contactIsRequired: false };

    expect(userFormSchema.safeParse(withoutContact).success).toBe(true);
  });

  it('should refuse a profile the api does not know', () => {
    const result = userFormSchema.safeParse({ ...VALID, profileType: 'Owner' });

    expect(result.error?.issues[0]?.path).toEqual(['profileType']);
  });
});
