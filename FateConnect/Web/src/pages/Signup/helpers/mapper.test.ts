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
  zipCode: '18000-000',
  street: 'Rua das Flores',
  streetNumber: '100',
  complement: 'Apto 12',
  city: 'Sorocaba',
  state: 'SP',
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

  // A API documenta o CEP com o hífen e o telefone só com dígitos.
  it('should keep the zip code masked and send the phone as digits', () => {
    const request = toSignupRequest(FILLED);

    expect(request.addresses[0]?.zipCode).toBe('18000-000');
    expect(request.contacts[0]?.phone).toBe('15999999999');
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
});
