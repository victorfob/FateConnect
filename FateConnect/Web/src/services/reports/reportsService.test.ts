import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';

import { apiClient } from '../httpClient';
import { createReport, updateReportStatus } from './reportsService';
import { ReportCategoryEnum, ReportStatusEnum, type ReportInput } from './types';

const REPORTS_URL = 'https://api.fateconnect.test/reports';

const CREATED = 201;

const REPORT_INPUT: ReportInput = {
  category: ReportCategoryEnum.RECKLESS_DRIVING,
  description: 'A pessoa dirigiu acima da velocidade no trajeto inteiro.',
  isAnonymous: false,
  image: null,
};

const SENT_FIELDS = {
  Category: ReportCategoryEnum.RECKLESS_DRIVING,
  Description: 'A pessoa dirigiu acima da velocidade no trajeto inteiro.',
  IsAnonymous: 'false',
};

const NEW_REPORT_ID = '0f0a6c2e-6d44-4a7f-9a0b-3f2c1e8d5a71';

/**
 * A API recebe `[FromForm]`, e ler o corpo como formulário é o que faz o stub
 * reprovar um JSON — como ela reprovaria.
 */
async function fieldsOf(request: Request): Promise<Record<string, FormDataEntryValue>> {
  return Object.fromEntries(await request.formData());
}

describe('reportsService', () => {
  it('should post the report as a form the model binder reads', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(REPORTS_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: NEW_REPORT_ID }, { status: CREATED });
      }),
    );

    const created = await createReport(REPORT_INPUT);

    expect(fields).toEqual(SENT_FIELDS);
    expect(created.id).toBe(NEW_REPORT_ID);
  });

  /** O binder lê o booleano do texto, então `true` tem de viajar escrito. */
  it('should send the hidden name choice as text', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(REPORTS_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: NEW_REPORT_ID }, { status: CREATED });
      }),
    );

    await createReport({ ...REPORT_INPUT, isAnonymous: true });

    expect(fields).toEqual({ ...SENT_FIELDS, IsAnonymous: 'true' });
  });

  /**
   * A foto é o único campo que não atravessa o stub: o `File` do jsdom não passa
   * na checagem do undici que o interceptador usa para montar a requisição, e no
   * navegador ela atravessa. O que dá para afirmar aqui é o corpo que o serviço
   * entrega ao cliente HTTP, que é onde a decisão de mandar a foto acontece.
   */
  it('should put the chosen photo in the same body as the report', async () => {
    const photo = new File(['conteúdo'], 'print.png', { type: 'image/png' });
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { id: NEW_REPORT_ID } });

    const created = await createReport({ ...REPORT_INPUT, image: photo });

    const [path, body] = post.mock.calls[0]!;
    expect(path).toBe('/reports');
    expect(Object.fromEntries(body as FormData)).toMatchObject(SENT_FIELDS);
    expect((body as FormData).get('Image')).toBe(photo);
    expect(created.id).toBe(NEW_REPORT_ID);

    post.mockRestore();
  });
});

describe('updateReportStatus', () => {
  const NO_CONTENT = 204;

  it('should send the chosen status to the report it names', async () => {
    const received: { id: string; body: unknown }[] = [];
    server.use(
      http.patch<{ reportId: string }>(
        `${REPORTS_URL}/:reportId/status`,
        async ({ params, request }) => {
          received.push({ id: params.reportId, body: await request.json() });

          return new HttpResponse(null, { status: NO_CONTENT });
        },
      ),
    );

    await updateReportStatus(NEW_REPORT_ID, ReportStatusEnum.IN_REVIEW);

    expect(received).toEqual([{ id: NEW_REPORT_ID, body: { Status: ReportStatusEnum.IN_REVIEW } }]);
  });
});
