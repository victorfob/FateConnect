import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { apiClient } from '../httpClient';
import { createDenunciation, updateDenunciationStatus } from './denunciationsService';
import { DenunciationCategoryEnum, DenunciationStatusEnum, type DenunciationInput } from './types';

const DENUNCIATIONS_URL = 'https://api.fateconnect.test/denunciations';

const CREATED = 201;

const DENUNCIATION_INPUT: DenunciationInput = {
  category: DenunciationCategoryEnum.RECKLESS_DRIVING,
  description: 'A pessoa dirigiu acima da velocidade no trajeto inteiro.',
  isAnonymous: false,
  image: null,
};

const SENT_FIELDS = {
  Category: DenunciationCategoryEnum.RECKLESS_DRIVING,
  Description: 'A pessoa dirigiu acima da velocidade no trajeto inteiro.',
  IsAnonymous: 'false',
};

const NEW_DENUNCIATION_ID = '0f0a6c2e-6d44-4a7f-9a0b-3f2c1e8d5a71';

/**
 * A API recebe `[FromForm]`, e ler o corpo como formulário é o que faz o stub
 * reprovar um JSON — como ela reprovaria.
 */
async function fieldsOf(request: Request): Promise<Record<string, FormDataEntryValue>> {
  return Object.fromEntries(await request.formData());
}

describe('denunciationsService', () => {
  it('should post the denunciation as a form the model binder reads', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(DENUNCIATIONS_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: NEW_DENUNCIATION_ID }, { status: CREATED });
      }),
    );

    const created = await createDenunciation(DENUNCIATION_INPUT);

    expect(fields).toEqual(SENT_FIELDS);
    expect(created.id).toBe(NEW_DENUNCIATION_ID);
  });

  /** O binder lê o booleano do texto, então `true` tem de viajar escrito. */
  it('should send the hidden name choice as text', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(DENUNCIATIONS_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: NEW_DENUNCIATION_ID }, { status: CREATED });
      }),
    );

    await createDenunciation({ ...DENUNCIATION_INPUT, isAnonymous: true });

    expect(fields).toEqual({ ...SENT_FIELDS, IsAnonymous: 'true' });
  });

  /**
   * A foto é o único campo que não atravessa o stub: o `File` do jsdom não passa
   * na checagem do undici que o interceptador usa para montar a requisição, e no
   * navegador ela atravessa. O que dá para afirmar aqui é o corpo que o serviço
   * entrega ao cliente HTTP, que é onde a decisão de mandar a foto acontece.
   */
  it('should put the chosen photo in the same body as the denunciation', async () => {
    const photo = new File(['conteúdo'], 'print.png', { type: 'image/png' });
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { id: NEW_DENUNCIATION_ID } });

    const created = await createDenunciation({ ...DENUNCIATION_INPUT, image: photo });

    const [path, body] = post.mock.calls[0]!;
    expect(path).toBe('/denunciations');
    expect(Object.fromEntries(body as FormData)).toMatchObject(SENT_FIELDS);
    expect((body as FormData).get('Image')).toBe(photo);
    expect(created.id).toBe(NEW_DENUNCIATION_ID);

    post.mockRestore();
  });
});

describe('updateDenunciationStatus', () => {
  const NO_CONTENT = 204;

  it('should send the chosen status to the denunciation it names', async () => {
    const received: { id: string; body: unknown }[] = [];
    server.use(
      http.patch<{ denunciationId: string }>(
        `${DENUNCIATIONS_URL}/:denunciationId/status`,
        async ({ params, request }) => {
          received.push({ id: params.denunciationId, body: await request.json() });

          return new HttpResponse(null, { status: NO_CONTENT });
        },
      ),
    );

    await updateDenunciationStatus(NEW_DENUNCIATION_ID, DenunciationStatusEnum.IN_REVIEW);

    expect(received).toEqual([
      { id: NEW_DENUNCIATION_ID, body: { Status: DenunciationStatusEnum.IN_REVIEW } },
    ]);
  });
});
