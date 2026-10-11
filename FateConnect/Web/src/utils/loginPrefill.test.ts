import { loginPrefillState, prefilledEmailOf } from './loginPrefill';

describe('loginPrefill', () => {
  it('should read back the email it stored in the navigation state', () => {
    expect(prefilledEmailOf(loginPrefillState('aluno@aluno.cps.sp.gov.br'))).toBe(
      'aluno@aluno.cps.sp.gov.br',
    );
  });

  it('should ignore a state that does not carry an email', () => {
    expect(prefilledEmailOf(null)).toBeUndefined();
    expect(prefilledEmailOf('aluno@aluno.cps.sp.gov.br')).toBeUndefined();
    expect(prefilledEmailOf({ email: 42 })).toBeUndefined();
    expect(prefilledEmailOf(loginPrefillState(''))).toBeUndefined();
  });
});
