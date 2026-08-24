import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { createLostItem, listLostItems, updateLostItem } from './lostAndFoundService';
import { LostItemKindEnum, LostItemStatusEnum, type LostItemInput } from './types';

const LOST_ITEM_INPUT: LostItemInput = {
  nome: 'Garrafa térmica',
  tipo: LostItemKindEnum.FOUND,
  local: 'Biblioteca',
  dataOcorrido: '2026-08-20',
  descricao: 'Garrafa azul, com adesivos na tampa.',
};

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

  it('should post the item on creation and return what the api answered', async () => {
    let body: LostItemInput | null = null;
    server.use(
      http.post(LOST_AND_FOUND_URL, async ({ request }) => {
        body = (await request.json()) as LostItemInput;
        return HttpResponse.json({ id: 'novo', ...LOST_ITEM_INPUT }, { status: 201 });
      }),
    );

    const created = await createLostItem(LOST_ITEM_INPUT);

    expect(body).toEqual(LOST_ITEM_INPUT);
    expect(created.id).toBe('novo');
  });

  it('should put the item under its own id on update', async () => {
    const itemId = 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14';
    let requestUrl: string | null = null;
    server.use(
      http.put(`${LOST_AND_FOUND_URL}/:id`, ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({ id: itemId, ...LOST_ITEM_INPUT });
      }),
    );

    const updated = await updateLostItem(itemId, LOST_ITEM_INPUT);

    expect(requestUrl).toBe(`${LOST_AND_FOUND_URL}/${itemId}`);
    expect(updated.id).toBe(itemId);
  });
});
