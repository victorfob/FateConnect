import { SIGNUP_MESSAGES } from '@app/pages/Signup/schema';

import { PASSWORD_MESSAGES, profileSchema, type ProfileFormInput } from '.';

const VALID: ProfileFormInput = {
  fullName: 'Maria da Silva',
  birthDate: '18/04/2001',
  gender: 'Female',
  phone: '(15) 99123-4567',
  contactEmail: 'maria.silva@gmail.com',
  neighborhood: 'Jardim Vergueiro',
  photo: null,
  removeStoredPhoto: false,
  currentPassword: '',
  newPassword: '',
};

function issuesOf(input: ProfileFormInput) {
  const result = profileSchema.safeParse(input);
  if (result.success) return [];

  return result.error.issues.map(({ path, message }) => ({ path: path.join('.'), message }));
}

describe('profileSchema', () => {
  it('should accept the profile with both password fields blank', () => {
    expect(issuesOf(VALID)).toEqual([]);
  });

  it('should accept an empty neighborhood, which clears it', () => {
    expect(issuesOf({ ...VALID, neighborhood: '' })).toEqual([]);
  });

  it('should ask for the current password once a new one is typed', () => {
    expect(issuesOf({ ...VALID, newPassword: 'NovaSenha123' })).toEqual([
      { path: 'currentPassword', message: PASSWORD_MESSAGES.currentRequired },
    ]);
  });

  it('should ask for the new password once the current one is typed', () => {
    expect(issuesOf({ ...VALID, currentPassword: 'SenhaAtual123' })).toEqual([
      { path: 'newPassword', message: PASSWORD_MESSAGES.newRequired },
    ]);
  });

  it('should hold the new password to the signup rule', () => {
    expect(issuesOf({ ...VALID, currentPassword: 'SenhaAtual123', newPassword: 'curta' })).toEqual([
      { path: 'newPassword', message: SIGNUP_MESSAGES.passwordTooShort },
    ]);
  });

  it('should accept a password change with both fields', () => {
    expect(
      issuesOf({ ...VALID, currentPassword: 'SenhaAtual123', newPassword: 'NovaSenha123' }),
    ).toEqual([]);
  });

  it('should hold the shared fields to the signup rules', () => {
    expect(issuesOf({ ...VALID, fullName: '' })).toEqual([
      { path: 'fullName', message: SIGNUP_MESSAGES.fullNameRequired },
    ]);
  });
});
