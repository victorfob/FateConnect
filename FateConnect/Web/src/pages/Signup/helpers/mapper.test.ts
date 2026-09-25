import { PRIVACY_VERSION, TERMS_VERSION } from '@app/constants/legalDocuments';
import { DocumentTypeEnum } from '@app/services/signup/types';

import { GenderValueEnum } from '../@types';
import { SIGNUP_DEFAULT_VALUES, type SignupFormValues } from '../schema';
import { toSignupRequest } from './mapper';

const FILLED: SignupFormValues = {
  ...SIGNUP_DEFAULT_VALUES,
  fullName: 'Maria Silva',
  fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
  password: 'segredo123',
  birthDate: '22/05/1999',
  gender: GenderValueEnum.FEMALE,
  phone: '(15) 99999-9999',
  contactEmail: 'maria@exemplo.com',
  acceptTerms: true,
};

describe('toSignupRequest', () => {
  it('should translate the form into the backend contract', () => {
    const request = toSignupRequest(FILLED);

    expect(request.fullName).toBe('Maria Silva');
    expect(request.fatecEmail).toBe('maria.silva@aluno.cps.sp.gov.br');
    expect(request.birthDate).toContain('1999-05-22');
    expect(request.gender).toBe(GenderValueEnum.FEMALE);
  });

  it('should send the phone as digits', () => {
    const request = toSignupRequest(FILLED);

    expect(request.phone).toBe('15999999999');
  });

  // `toISOString()` sobre a data local move o instante e, a leste de
  // Greenwich, o dia inteiro.
  it('should send the birth date as midnight in utc', () => {
    const request = toSignupRequest(FILLED);

    expect(request.birthDate).toBe('1999-05-22T00:00:00Z');
  });

  it('should send an empty birth date when the typed one is not a date', () => {
    const request = toSignupRequest({ ...FILLED, birthDate: '99/99/9999' });

    expect(request.birthDate).toBe('');
  });

  it('should send one acceptance per document, each with the version it was read at', () => {
    const request = toSignupRequest(FILLED);

    expect(request.acceptances).toEqual([
      { document: DocumentTypeEnum.TERMS_OF_USE, version: TERMS_VERSION },
      { document: DocumentTypeEnum.PRIVACY_POLICY, version: PRIVACY_VERSION },
    ]);
  });

  it('should turn both preferences on from the single checkbox', () => {
    const request = toSignupRequest({ ...FILLED, acceptMarketing: true });

    expect(request.receiveEmails).toBe(true);
    expect(request.receiveNotifications).toBe(true);
  });

  it('should leave both preferences off when the checkbox is unticked', () => {
    const request = toSignupRequest({ ...FILLED, acceptMarketing: false });

    expect(request.receiveEmails).toBe(false);
    expect(request.receiveNotifications).toBe(false);
  });

  /**
   * ⛔ `toEqual` e não `toMatchObject`: o que esta asserção guarda é o que
   * **sobra** — nada do formulário pode vazar para o corpo da requisição.
   */
  it('should send the contract and nothing else', () => {
    const request = toSignupRequest(FILLED);

    expect(request).toEqual({
      fullName: 'Maria Silva',
      fatecEmail: 'maria.silva@aluno.cps.sp.gov.br',
      password: 'segredo123',
      birthDate: '1999-05-22T00:00:00Z',
      gender: GenderValueEnum.FEMALE,
      phone: '15999999999',
      contactEmail: 'maria@exemplo.com',
      acceptances: [
        { document: DocumentTypeEnum.TERMS_OF_USE, version: TERMS_VERSION },
        { document: DocumentTypeEnum.PRIVACY_POLICY, version: PRIVACY_VERSION },
      ],
      receiveEmails: false,
      receiveNotifications: false,
    });
  });
});
