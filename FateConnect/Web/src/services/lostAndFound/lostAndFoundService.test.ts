import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { listLostItems } from './lostAndFoundService';
import { LostItemKindEnum, LostItemStatusEnum } from './types';

const LOST_AND_FOUND_URL = 'https://api.fateconnect.test/achado';

describe('lostAndFoundService', () => {
  it('should translate the front filters into the api query parameters', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(LOST_AND_FOUND_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json([]);
      }),
    );

    await listLostItems({
      name: 'Garrafa térmica',
      occurredOn: '2026-08-20',
      kind: LostItemKindEnum.FOUND,
      onlyMine: true,
      status: LostItemStatusEnum.OPEN,
    });

    expect(received!.get('Nome')).toBe('Garrafa térmica');
    expect(received!.get('DataOcorrido')).toBe('2026-08-20');
    expect(received!.get('Tipo')).toBe(LostItemKindEnum.FOUND);
    expect(received!.get('MeusItens')).toBe('true');
    expect(received!.get('Situacao')).toBe(LostItemStatusEnum.OPEN);
  });

  it('should omit parameters that were not filled in, including the unchecked mine flag', async () => {
    let received: URLSearchParams | null = null;
    server.use(
      http.get(LOST_AND_FOUND_URL, ({ request }) => {
        received = new URL(request.url).searchParams;
        return HttpResponse.json([]);
      }),
    );

    await listLostItems({ name: 'Garrafa térmica', onlyMine: false });

    expect([...received!.keys()]).toEqual(['Nome']);
  });

  it('should list items without filters', async () => {
    server.use(
      http.get(LOST_AND_FOUND_URL, () => HttpResponse.json([{ id: 'c7d2', nome: 'Guarda-chuva' }])),
    );

    const items = await listLostItems();

    expect(items).toHaveLength(1);
  });

  it('should fail when the response is not a list', async () => {
    server.use(
      http.get(LOST_AND_FOUND_URL, () => HttpResponse.text('<!doctype html><html></html>')),
    );

    await expect(listLostItems()).rejects.toThrow(/não é uma lista/);
  });
});
