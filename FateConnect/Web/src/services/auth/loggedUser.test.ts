import { tokenWithName } from '@app/test/token';

import { loggedUserIsAdministrator, loggedUserName } from './loggedUser';
import { tokenStorage } from './tokenStorage';
import { ProfileTypeEnum } from './types';

describe('loggedUserName', () => {
  it('should read the name from the token', () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));

    expect(loggedUserName()).toBe('Maria da Silva');
  });

  it('should keep the accents, which a byte-by-byte reading would corrupt', () => {
    tokenStorage.save(tokenWithName('João Ávila Conceição'));

    expect(loggedUserName()).toBe('João Ávila Conceição');
  });

  it('should return nothing when nobody is logged', () => {
    expect(loggedUserName()).toBeNull();
  });

  // O malformado nem chega a ser decodificado; o indecifrável chega, e o `atob`
  // recusa — são os dois lados do `try`.
  it.each([
    ['the token carries no name', 'cabecalho.eyJuYW1laWQiOiI3In0.assinatura'],
    ['the token is malformed', 'isto-nao-e-um-token'],
    ['the payload is not decodable', 'cabecalho.@@@@.assinatura'],
  ])('should return nothing when %s', (_name, token) => {
    tokenStorage.save(token);

    expect(loggedUserName()).toBeNull();
  });
});

describe('loggedUserIsAdministrator', () => {
  it('should recognise the administrator profile in the token', () => {
    tokenStorage.save(tokenWithName('Maria da Silva', ProfileTypeEnum.ADMINISTRATOR));

    expect(loggedUserIsAdministrator()).toBe(true);
  });

  it('should refuse the operator profile', () => {
    tokenStorage.save(tokenWithName('Maria da Silva', ProfileTypeEnum.OPERATOR));

    expect(loggedUserIsAdministrator()).toBe(false);
  });

  it('should refuse a token that carries no profile', () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));

    expect(loggedUserIsAdministrator()).toBe(false);
  });

  it('should refuse when nobody is logged', () => {
    expect(loggedUserIsAdministrator()).toBe(false);
  });
});
