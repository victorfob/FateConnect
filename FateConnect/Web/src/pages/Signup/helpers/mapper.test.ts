import { describe, expect, it } from 'vitest';

import { GenderValueEnum } from '../@types';
import { SIGNUP_DEFAULT_VALUES, type SignupFormValues } from '../schema';
import { toSignupRequest } from './mapper';

const FILLED: SignupFormValues = {
  ...SIGNUP_DEFAULT_VALUES,
  fullName: 'Maria Silva',
  nickname: 'Mari',
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

    expect(request.nomeCompleto).toBe('Maria Silva');
    expect(request.apelido).toBe('Mari');
    expect(request.emailFatec).toBe('maria.silva@aluno.cps.sp.gov.br');
    expect(request.dataNascimento).toContain('1999-05-22');
    expect(request.genero).toBe(Number(GenderValueEnum.FEMALE));
  });

  // O backend prefere a ausência da chave a uma string vazia.
  it('should omit the optional nickname instead of sending it empty', () => {
    const request = toSignupRequest({ ...FILLED, nickname: '' });

    expect(request.apelido).toBeUndefined();
  });

  it('should strip the mask from the zip code and the phone', () => {
    const request = toSignupRequest(FILLED);

    expect(request.enderecos[0]?.cep).toBe('18000000');
    expect(request.contatos[0]?.telefone).toBe('15999999999');
  });

  it('should send an empty birth date when the typed one is not a date', () => {
    const request = toSignupRequest({ ...FILLED, birthDate: '99/99/9999' });

    expect(request.dataNascimento).toBe('');
  });
});
