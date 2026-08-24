import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@app/mocks/server';

import { isCepNotFound, lookupCep } from './cepService';

const PRIMARY_URL = 'https://viacep.com.br/ws/18000000/json/';
const FALLBACK_URL = 'https://opencep.com/v1/18000000.json';

describe('lookupCep', () => {
  it('should return the address from the primary provider', async () => {
    server.use(http.get(PRIMARY_URL, () => HttpResponse.json({ localidade: 'Sorocaba' })));

    const address = await lookupCep('18000000');

    expect(address.localidade).toBe('Sorocaba');
  });

  it('should fall back to the secondary provider when the primary fails', async () => {
    server.use(
      http.get(PRIMARY_URL, () => new HttpResponse(null, { status: 500 })),
      http.get(FALLBACK_URL, () => HttpResponse.json({ localidade: 'Sorocaba' })),
    );

    const address = await lookupCep('18000000');

    expect(address.localidade).toBe('Sorocaba');
  });

  // Cancelamento não é falha do provedor: cair no secundário seria disparar uma
  // requisição que o chamador acabou de abortar.
  it('should not try the secondary provider when the lookup was cancelled', async () => {
    server.use(
      http.get(PRIMARY_URL, () => HttpResponse.json({ localidade: 'Sorocaba' })),
      http.get(FALLBACK_URL, () => {
        throw new Error('o provedor secundário não deveria ser consultado');
      }),
    );
    const controller = new AbortController();
    controller.abort();

    await expect(lookupCep('18000000', controller.signal)).rejects.toSatisfy(axios.isCancel);
  });

  it('should flag a zip code the primary provider reports as missing', () => {
    expect(isCepNotFound({ erro: 'true' })).toBe(true);
    expect(isCepNotFound({ localidade: 'Sorocaba' })).toBe(false);
  });
});
