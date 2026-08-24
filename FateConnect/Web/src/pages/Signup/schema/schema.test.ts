import { describe, expect, it } from 'vitest';

import { SIGNUP_DEFAULT_VALUES, type SignupFormValues, signupSchema } from '.';
import { GenderValueEnum } from '../@types';
import { formatBirthDate, latestBirthDate } from '../helpers/birthDate';

const ONE_DAY_MS = 86_400_000;

const VALID: SignupFormValues = {
  ...SIGNUP_DEFAULT_VALUES,
  fullName: 'Maria Silva',
  fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
  birthDate: '22/05/1999',
  gender: GenderValueEnum.FEMALE,
  password: 'segredo123',
  zipCode: '18000-000',
  state: 'SP',
  city: 'Sorocaba',
  street: 'Rua das Flores',
  streetNumber: '100',
  phone: '(11) 91234-5678',
  contactEmail: 'maria@exemplo.com',
  acceptTerms: true,
};

function parse(overrides: Partial<SignupFormValues> = {}) {
  return signupSchema.safeParse({ ...VALID, ...overrides });
}

function firstIssuePath(result: ReturnType<typeof parse>) {
  if (result.success) return undefined;

  return result.error.issues[0]?.path;
}

describe('signupSchema', () => {
  it('should accept a complete form', () => {
    expect(parse().success).toBe(true);
  });

  it('should accept the form without the optional fields', () => {
    const result = parse({ nickname: '', complement: '', acceptMarketing: false });

    expect(result.success).toBe(true);
  });

  it.each([
    ['fullName', { fullName: '' }],
    ['fatecEmail', { fatecEmail: '' }],
    ['birthDate', { birthDate: '' }],
    ['gender', { gender: '' }],
    ['password', { password: '' }],
    ['phone', { phone: '' }],
    ['contactEmail', { contactEmail: '' }],
  ])('should require %s', (field, overrides) => {
    const result = parse(overrides);

    expect(result.success).toBe(false);
    expect(firstIssuePath(result)).toEqual([field]);
  });

  it('should reject an email without a domain', () => {
    const result = parse({ fatecEmail: 'maria@' });

    expect(firstIssuePath(result)).toEqual(['fatecEmail']);
  });

  it('should reject a password below eight characters', () => {
    expect(parse({ password: '1234567' }).success).toBe(false);
    expect(parse({ password: '12345678' }).success).toBe(true);
  });

  it.each([
    ['ten digits', '(11) 2345-6789'],
    ['eleven digits', '(11) 91234-5678'],
  ])('should accept a phone number with %s', (_, phone) => {
    expect(parse({ phone }).success).toBe(true);
  });

  it('should reject a phone number outside that range', () => {
    expect(firstIssuePath(parse({ phone: '(11) 2345-678' }))).toEqual(['phone']);
  });

  it('should reject a date that does not exist in the calendar', () => {
    expect(firstIssuePath(parse({ birthDate: '31/02/1999' }))).toEqual(['birthDate']);
  });

  it('should reject a date before the earliest one allowed', () => {
    expect(parse({ birthDate: '31/12/1899' }).success).toBe(false);
    expect(parse({ birthDate: '01/01/1900' }).success).toBe(true);
  });

  it('should accept whoever turns eighteen today and reject one day short', () => {
    const eighteenToday = latestBirthDate();
    const oneDayShort = new Date(eighteenToday.getTime() + ONE_DAY_MS);

    expect(parse({ birthDate: formatBirthDate(eighteenToday) }).success).toBe(true);
    expect(firstIssuePath(parse({ birthDate: formatBirthDate(oneDayShort) }))).toEqual([
      'birthDate',
    ]);
  });

  it('should require the terms to be accepted', () => {
    expect(firstIssuePath(parse({ acceptTerms: false }))).toEqual(['acceptTerms']);
  });
});
