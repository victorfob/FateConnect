import type { z } from 'zod';

import { CONTACT_MESSAGES, MAX_CONTACT_EMAIL_LENGTH } from '../constants';
import { checkContact, contactFieldsSchema } from '.';

type ContactInput = z.input<typeof contactFieldsSchema>;

const ONE_CHARACTER = 1;
const EMAIL_SUFFIX = '@exemplo.com';

const contactSchema = contactFieldsSchema.superRefine(checkContact);

const VALID: ContactInput = {
  phone: '(11) 91234-5678',
  contactEmail: 'maria@exemplo.com',
  contactIsRequired: false,
};

const EMPTY: ContactInput = { phone: '', contactEmail: '', contactIsRequired: false };

function parse(overrides: Partial<ContactInput> = {}, base: ContactInput = VALID) {
  return contactSchema.safeParse({ ...base, ...overrides });
}

function issuesOf(result: ReturnType<typeof parse>) {
  if (result.success) return [];

  return result.error.issues.map(({ path, message }) => ({ path, message }));
}

function emailOfLength(total: number): string {
  return 'a'.repeat(total - EMAIL_SUFFIX.length) + EMAIL_SUFFIX;
}

describe('contactFieldsSchema', () => {
  it('should accept the phone and the email together', () => {
    expect(parse().success).toBe(true);
  });

  it('should accept both empty for whoever has no contact yet', () => {
    expect(parse({}, EMPTY).success).toBe(true);
  });

  it('should ask for the email when only the phone was filled', () => {
    expect(issuesOf(parse({ contactEmail: '' }))).toEqual([
      { path: ['contactEmail'], message: CONTACT_MESSAGES.contactEmailRequired },
    ]);
  });

  it('should ask for the phone when only the email was filled', () => {
    expect(issuesOf(parse({ phone: '' }))).toEqual([
      { path: ['phone'], message: CONTACT_MESSAGES.phoneRequired },
    ]);
  });

  it('should keep both required for whoever already has a contact', () => {
    expect(issuesOf(parse({ contactIsRequired: true }, EMPTY))).toEqual([
      { path: ['phone'], message: CONTACT_MESSAGES.phoneRequired },
      { path: ['contactEmail'], message: CONTACT_MESSAGES.contactEmailRequired },
    ]);
  });

  it.each([
    ['ten digits', '(11) 2345-6789'],
    ['eleven digits', '(11) 91234-5678'],
  ])('should accept a phone number with %s', (_, phone) => {
    expect(parse({ phone }).success).toBe(true);
  });

  it('should reject a phone number outside that range', () => {
    expect(issuesOf(parse({ phone: '(11) 2345-678' }))).toEqual([
      { path: ['phone'], message: CONTACT_MESSAGES.phoneInvalid },
    ]);
  });

  it('should reject an email that is not one', () => {
    expect(issuesOf(parse({ contactEmail: 'nao-e-email' }))).toEqual([
      { path: ['contactEmail'], message: CONTACT_MESSAGES.contactEmailInvalid },
    ]);
  });

  it('should hold the email to the length the api accepts', () => {
    expect(parse({ contactEmail: emailOfLength(MAX_CONTACT_EMAIL_LENGTH) }).success).toBe(true);
    expect(
      parse({ contactEmail: emailOfLength(MAX_CONTACT_EMAIL_LENGTH + ONE_CHARACTER) }).success,
    ).toBe(false);
  });
});
