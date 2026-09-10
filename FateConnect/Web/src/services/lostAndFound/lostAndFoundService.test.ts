import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { apiClient } from '../httpClient';
import {
  createLostItem,
  deleteLostItem,
  fetchStoredImage,
  listLostItems,
  resolveLostItem,
  restoreLostItem,
  updateLostItem,
} from './lostAndFoundService';
import { LostItemKindEnum, LostItemStatusEnum, type LostItemInput } from './types';

const LOST_AND_FOUND_URL = 'https://api.fateconnect.test/lostandfound';
const ITEM_ID = 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14';

const FIRST_PAGE = 1;
const PAGE_SIZE = 10;
const SINGLE_PAGE = 1;

const NO_CONTENT = 204;
const CREATED = 201;

const LOST_ITEM_INPUT: LostItemInput = {
  name: 'Garrafa térmica',
  lostAndFoundType: LostItemKindEnum.FOUND,
  place: 'Biblioteca',
  ocurredOn: '2026-08-20',
  description: 'Garrafa azul, com adesivos na tampa.',
  image: null,
};

const SENT_FIELDS = {
  Name: 'Garrafa térmica',
  LostAndFoundType: LostItemKindEnum.FOUND,
  Place: 'Biblioteca',
  OcurredOn: '2026-08-20',
  Description: 'Garrafa azul, com adesivos na tampa.',
};

/**
 * A API recebe `[FromForm]` nos dois verbos de escrita, e ler o corpo como
 * formulário é o que faz o stub reprovar um JSON — como ela reprovaria.
 */
async function fieldsOf(request: Request): Promise<Record<string, FormDataEntryValue>> {
  return Object.fromEntries(await request.formData());
}

function pageOf(items: unknown[]) {
  return {
    items,
    page: FIRST_PAGE,
    pageSize: PAGE_SIZE,
    total: items.length,
    totalPages: SINGLE_PAGE,
  };
}

function listingRecording(received: { params?: URLSearchParams }) {
  server.use(
    http.get(LOST_AND_FOUND_URL, ({ request }) => {
      received.params = new URL(request.url).searchParams;

      return HttpResponse.json(pageOf([]));
    }),
  );
}

/** Guarda o que chegou no recurso do item, para o caso conferir depois. */
function itemEndpointRecording(received: Record<string, FormDataEntryValue>[]) {
  server.use(
    http.patch(`${LOST_AND_FOUND_URL}/:itemId`, async ({ request }) => {
      received.push(await fieldsOf(request));

      return HttpResponse.json({ id: ITEM_ID });
    }),
  );
}

describe('lostAndFoundService', () => {
  it('should ask the listing by the names the api takes', async () => {
    const received: { params?: URLSearchParams } = {};
    listingRecording(received);

    await listLostItems({
      searchTerm: 'Garrafa térmica',
      dateFrom: '2026-08-20',
      dateTo: '2026-08-24',
      lostAndFoundType: LostItemKindEnum.FOUND,
      onlyMine: true,
      status: LostItemStatusEnum.OPEN,
    });

    expect(Object.fromEntries(received.params!)).toEqual({
      searchTerm: 'Garrafa térmica',
      dateFrom: '2026-08-20',
      dateTo: '2026-08-24',
      lostAndFoundType: LostItemKindEnum.FOUND,
      onlyMine: 'true',
      status: LostItemStatusEnum.OPEN,
    });
  });

  it('should leave out of the query what the filter did not fill in', async () => {
    const received: { params?: URLSearchParams } = {};
    listingRecording(received);

    await listLostItems({ searchTerm: 'Garrafa térmica' });

    expect([...received.params!.keys()]).toEqual(['searchTerm']);
  });

  // Omitir a situação é como a opção "Todas" pede todas elas, inclusive as excluídas.
  it('should ask without a status when no status was chosen', async () => {
    const received: { params?: URLSearchParams } = {};
    listingRecording(received);

    await listLostItems({ page: 2, pageSize: PAGE_SIZE });

    expect(received.params!.has('status')).toBe(false);
    expect(received.params!.get('page')).toBe('2');
  });

  it('should list items without filters', async () => {
    server.use(
      http.get(LOST_AND_FOUND_URL, () =>
        HttpResponse.json(pageOf([{ id: 'c7d2', name: 'Guarda-chuva' }])),
      ),
    );

    const page = await listLostItems();

    expect(page.items).toHaveLength(1);
  });

  it('should fail when the response is not a list', async () => {
    server.use(
      http.get(LOST_AND_FOUND_URL, () => HttpResponse.text('<!doctype html><html></html>')),
    );

    await expect(listLostItems()).rejects.toThrow(/não é uma página/);
  });

  /**
   * A foto é o único campo que não atravessa o stub: o `File` do jsdom não passa
   * na checagem do undici que o interceptador usa para montar a requisição, e no
   * navegador ela atravessa. O que dá para afirmar aqui é o corpo que o serviço
   * entrega ao cliente HTTP, que é onde a decisão de mandar a foto acontece.
   */
  it('should put the chosen photo in the same body as the item', async () => {
    const photo = new File(['foto'], 'garrafa.png', { type: 'image/png' });
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { id: 'novo' } });

    const created = await createLostItem({ ...LOST_ITEM_INPUT, image: photo });

    const [path, body] = post.mock.calls[0]!;
    expect(path).toBe('/lostandfound');
    expect(Object.fromEntries(body as FormData)).toMatchObject(SENT_FIELDS);
    expect((body as FormData).get('Image')).toBe(photo);
    expect(created.id).toBe('novo');

    post.mockRestore();
  });

  it('should leave the image field out when no photo was chosen', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(LOST_AND_FOUND_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: 'novo' }, { status: CREATED });
      }),
    );

    await createLostItem(LOST_ITEM_INPUT);

    expect(fields).toEqual(SENT_FIELDS);
  });

  it('should patch the item under its own id on update', async () => {
    let requestUrl: string | null = null;
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.patch(`${LOST_AND_FOUND_URL}/:itemId`, async ({ request }) => {
        requestUrl = request.url;
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: ITEM_ID });
      }),
    );

    const updated = await updateLostItem(ITEM_ID, LOST_ITEM_INPUT);

    expect(requestUrl).toBe(`${LOST_AND_FOUND_URL}/${ITEM_ID}`);
    expect(fields).toEqual(SENT_FIELDS);
    expect(updated.id).toBe(ITEM_ID);
  });

  // A API só limpa a descrição quando o campo chega vazio; omiti-lo a deixaria como está.
  it('should send the description even when it is empty, which is what clears it', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.patch(`${LOST_AND_FOUND_URL}/:itemId`, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: ITEM_ID });
      }),
    );

    await updateLostItem(ITEM_ID, { ...LOST_ITEM_INPUT, description: '' });

    expect(fields!.Description).toBe('');
  });

  it('should conclude the item without touching any other field', async () => {
    const received: Record<string, FormDataEntryValue>[] = [];
    itemEndpointRecording(received);

    await resolveLostItem(ITEM_ID);

    expect(received).toEqual([{ Status: LostItemStatusEnum.RESOLVED }]);
  });

  it('should restore the item without touching any other field', async () => {
    const received: Record<string, FormDataEntryValue>[] = [];
    itemEndpointRecording(received);

    await restoreLostItem(ITEM_ID);

    expect(received).toEqual([{ Status: LostItemStatusEnum.OPEN }]);
  });

  // A API devolve o endereço da foto relativo e sem barra inicial, então ele tem
  // de cair sob a base da API — sob o endereço do site, o nginx responde o
  // index.html do front com 200 e nem 404 aparece no log.
  it('should fetch the stored image under the api base address', async () => {
    let requestUrl: string | null = null;
    server.use(
      http.get('https://api.fateconnect.test/uploads/lostandfound/:file', ({ request }) => {
        requestUrl = request.url;

        return new HttpResponse('bytes', { headers: { 'Content-Type': 'image/png' } });
      }),
    );

    const image = await fetchStoredImage('uploads/lostandfound/foto.png');

    expect(requestUrl).toBe('https://api.fateconnect.test/uploads/lostandfound/foto.png');
    expect(image.type).toBe('image/png');
  });

  it('should delete the item, leaving the reason to the server', async () => {
    const deleted: string[] = [];
    server.use(
      http.delete<{ itemId: string }>(`${LOST_AND_FOUND_URL}/:itemId`, ({ params }) => {
        deleted.push(params.itemId);

        return new HttpResponse(null, { status: NO_CONTENT });
      }),
    );

    await deleteLostItem(ITEM_ID);

    expect(deleted).toEqual([ITEM_ID]);
  });
});
