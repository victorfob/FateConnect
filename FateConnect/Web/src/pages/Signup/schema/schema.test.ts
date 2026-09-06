import { GenderValueEnum } from '../@types';
import { formatBirthDate, latestBirthDate } from '../helpers/birthDate';
import { SIGNUP_DEFAULT_VALUES, signupSchema, type SignupFormValues } from '.';

const ONE_DAY_MS = 86_400_000;
const ONE_CHARACTER = 1;

/** Os campos de texto que a API corta por comprimento. */
type TextField =
  'fullName' | 'fatecEmail' | 'street' | 'streetNumber' | 'complement' | 'city' | 'contactEmail';

function textOfLength(total: number, suffix: string): string {
  return 'a'.repeat(total - suffix.length) + suffix;
}

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
    const result = parse({ complement: '', acceptMarketing: false });

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

  /**
   * Cada campo com o comprimento que o DTO da API declara, e o sufixo que o
   * valor precisa manter para continuar válido — sem ele o e-mail deixaria de
   * ser e-mail antes de estourar o limite.
   */
  const MAX_LENGTHS: [TextField, number, string][] = [
    ['fullName', 200, ''],
    ['fatecEmail', 150, '@aluno.cps.sp.gov.br'],
    ['street', 200, ''],
    ['streetNumber', 20, ''],
    ['complement', 100, ''],
    ['city', 100, ''],
    ['contactEmail', 150, '@exemplo.com'],
  ];

  it.each(MAX_LENGTHS)('should hold %s to the length the api accepts', (field, max, suffix) => {
    expect(parse({ [field]: textOfLength(max, suffix) }).success).toBe(true);
    expect(firstIssuePath(parse({ [field]: textOfLength(max + ONE_CHARACTER, suffix) }))).toEqual([
      field,
    ]);
  });

  it('should require the terms to be accepted', () => {
    expect(firstIssuePath(parse({ acceptTerms: false }))).toEqual(['acceptTerms']);
  });
});
