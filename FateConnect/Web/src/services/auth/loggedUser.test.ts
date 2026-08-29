import { tokenWithName } from '@app/test/token';

import { loggedUserName } from './loggedUser';
import { tokenStorage } from './tokenStorage';

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

  it('should return nothing when the token carries no name', () => {
    tokenStorage.save('cabecalho.eyJuYW1laWQiOiI3In0.assinatura');

    expect(loggedUserName()).toBeNull();
  });

  it('should return nothing instead of breaking on a malformed token', () => {
    tokenStorage.save('isto-nao-e-um-token');

    expect(loggedUserName()).toBeNull();
  });
});
