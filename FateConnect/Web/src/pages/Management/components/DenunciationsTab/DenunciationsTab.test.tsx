import { createMemoryRouter, RouterProvider } from 'react-router';
import { FILTER_TITLE_PLURAL } from '@design-system';
import { http, HttpResponse } from 'msw';

import { CONTACT_LABEL } from '@app/components/ContactButton/constants';
import { DENUNCIATION_CARD_MARKERS } from '@app/components/DenunciationCard/constants';
import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { denunciationStatusLabel } from '@app/services/denunciations/denunciationStatus';
import {
  DenunciationCategoryEnum,
  DenunciationStatusEnum,
  type Denunciation,
} from '@app/services/denunciations/types';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';

import {
  FILTER_CLEAR_LABEL,
  FILTER_LABELS,
  FILTER_SUBMIT_LABEL,
} from './components/DenunciationsFilter/constants';
import {
  STATUS_DIALOG,
  STATUS_SELECT_LABEL,
} from './components/DenunciationStatusAction/constants';
import * as C from './constants';
import { DenunciationsTab } from '.';

const DENUNCIATIONS_URL = 'https://api.fateconnect.test/denunciations';

const IN_REVIEW_LABEL = denunciationStatusLabel(DenunciationStatusEnum.IN_REVIEW);
const DISMISSED_LABEL = denunciationStatusLabel(DenunciationStatusEnum.DISMISSED);
const RESOLVED_LABEL = denunciationStatusLabel(DenunciationStatusEnum.RESOLVED);

const OPEN_DENUNCIATION: Denunciation = {
  id: 'a3f1c0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  category: DenunciationCategoryEnum.RECKLESS_DRIVING,
  description: 'Dirigiu acima da velocidade o trajeto inteiro.',
  imageUrl: null,
  hasImage: false,
  status: DenunciationStatusEnum.OPEN,
  user: { name: 'Maria da Silva', email: 'maria@aluno.test', phone: '15999998888' },
  isAnonymous: false,
  createdAt: '2026-09-15T12:00:00',
};

const CONFIDENTIAL_DENUNCIATION: Denunciation = {
  ...OPEN_DENUNCIATION,
  id: 'b4a2d1e3-6c4f-5b7d-8e92-1f3a6c2b4d05',
  status: DenunciationStatusEnum.RESOLVED,
  user: null,
  isAnonymous: true,
};

function pageWith(items: Denunciation[]) {
  return { items, page: 1, pageSize: 10, total: items.length, totalPages: 1 };
}

function listServing(items: Denunciation[], onRequest?: (request: Request) => void) {
  server.use(
    http.get(DENUNCIATIONS_URL, ({ request }) => {
      onRequest?.(request);

      return HttpResponse.json(pageWith(items));
    }),
  );
}

function renderTab(initialEntry: string = RoutePathEnum.MANAGEMENT) {
  const router = createMemoryRouter(
    [{ path: RoutePathEnum.MANAGEMENT, element: <DenunciationsTab /> }],
    { initialEntries: [initialEntry] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('DenunciationsTab', () => {
  it('should reach who reported, which only the management does', async () => {
    listServing([OPEN_DENUNCIATION]);

    renderTab();

    await userEvent.click(await screen.findByRole('button', { name: CONTACT_LABEL }));

    expect(screen.getByText('Maria da Silva')).toBeInTheDocument();
  });

  // O marcador de sigilo, na mesma fileira, já diz por que não há a quem escrever.
  it('should offer no contact when the denunciation is confidential', async () => {
    listServing([CONFIDENTIAL_DENUNCIATION]);

    renderTab();

    expect(await screen.findByText(DENUNCIATION_CARD_MARKERS.confidential)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: CONTACT_LABEL })).not.toBeInTheDocument();
  });

  it('should drop the photo marker on a card that already shows the photo', async () => {
    listServing([
      { ...OPEN_DENUNCIATION, imageUrl: 'uploads/denunciation/foto.png', hasImage: true },
    ]);

    renderTab();
    await screen.findByText(OPEN_DENUNCIATION.description);

    expect(screen.queryByText(DENUNCIATION_CARD_MARKERS.photo)).not.toBeInTheDocument();
  });

  it('should offer only what the api accepts from the current status', async () => {
    listServing([OPEN_DENUNCIATION]);

    renderTab();
    await screen.findByText(OPEN_DENUNCIATION.description);

    await userEvent.click(screen.getByRole('combobox', { name: STATUS_SELECT_LABEL }));

    expect(screen.getByRole('option', { name: IN_REVIEW_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: DISMISSED_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: RESOLVED_LABEL })).not.toBeInTheDocument();
  });

  it('should offer no action at all once the denunciation is closed', async () => {
    listServing([CONFIDENTIAL_DENUNCIATION]);

    renderTab();
    await screen.findByText(DENUNCIATION_CARD_MARKERS.confidential);

    expect(screen.queryByRole('combobox', { name: STATUS_SELECT_LABEL })).not.toBeInTheDocument();
  });

  it('should ask before moving, because no transition goes back', async () => {
    listServing([OPEN_DENUNCIATION]);
    const sent: unknown[] = [];
    server.use(
      http.patch(`${DENUNCIATIONS_URL}/:id/status`, async ({ request }) => {
        sent.push(await request.json());

        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderTab();
    await screen.findByText(OPEN_DENUNCIATION.description);
    await userEvent.click(screen.getByRole('combobox', { name: STATUS_SELECT_LABEL }));
    await userEvent.click(screen.getByRole('option', { name: 'Em análise' }));

    expect(screen.getByText(STATUS_DIALOG.message)).toBeInTheDocument();
    expect(sent).toEqual([]);

    await userEvent.click(screen.getByRole('button', { name: STATUS_DIALOG.confirmLabel }));

    await waitFor(() => expect(sent).toEqual([{ Status: DenunciationStatusEnum.IN_REVIEW }]));
  });

  it('should keep the denunciation as it is when the confirmation is dismissed', async () => {
    listServing([OPEN_DENUNCIATION]);
    const sent: unknown[] = [];
    server.use(
      http.patch(`${DENUNCIATIONS_URL}/:id/status`, async ({ request }) => {
        sent.push(await request.json());

        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderTab();
    await screen.findByText(OPEN_DENUNCIATION.description);
    await userEvent.click(screen.getByRole('combobox', { name: STATUS_SELECT_LABEL }));
    await userEvent.click(screen.getByRole('option', { name: 'Em análise' }));
    await userEvent.click(screen.getByRole('button', { name: STATUS_DIALOG.dismissLabel }));

    expect(sent).toEqual([]);
  });

  it('should build the request from every field the filter offers', async () => {
    let asked: string | null = null;
    listServing([], (request) => {
      asked = request.url;
    });

    renderTab(
      `${RoutePathEnum.MANAGEMENT}?aba=denuncias&busca=velocidade&motivo=direcao-imprudente&situacao=aberta&de=2026-09-01&ate=2026-09-30`,
    );

    await waitFor(() => expect(asked).toContain('searchTerm=velocidade'));
    expect(asked).toContain('category=RecklessDriving');
    expect(asked).toContain('status=Open');
    expect(asked).toContain('dateFrom=2026-09-01');
    expect(asked).toContain('dateTo=2026-09-30');
  });

  it('should say what the empty list means and how to widen it', async () => {
    listServing([]);

    renderTab();

    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should ask the api for what the filter was given, and keep it in the address', async () => {
    const asked: string[] = [];
    listServing([], (request) => {
      asked.push(request.url);
    });
    const router = renderTab();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_PLURAL }));
    await userEvent.type(await screen.findByLabelText(FILTER_LABELS.searchTerm), 'velocidade');
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() => expect(asked.at(-1)).toContain('searchTerm=velocidade'));
    expect(router.state.location.search).toContain('busca=velocidade');
    // A aba continua no endereço: filtrar não pode apagá-la.
    expect(router.state.location.search).toContain('aba=denuncias');
  });

  it('should drop every filter when the search is cleared', async () => {
    const asked: string[] = [];
    listServing([], (request) => {
      asked.push(request.url);
    });
    const router = renderTab(`${RoutePathEnum.MANAGEMENT}?aba=denuncias&busca=velocidade`);
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_PLURAL }));
    await userEvent.click(await screen.findByRole('button', { name: FILTER_CLEAR_LABEL }));

    await waitFor(() => expect(asked.at(-1)).not.toContain('searchTerm'));
    expect(router.state.location.search).not.toContain('busca');
    expect(router.state.location.search).toContain('aba=denuncias');
  });

  it('should build the request from the motive, the status and the period too', async () => {
    const asked: string[] = [];
    listServing([], (request) => {
      asked.push(request.url);
    });
    renderTab();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_PLURAL }));
    await userEvent.type(
      await screen.findByLabelText(FILTER_LABELS.period),
      '01/09/2026 - 30/09/2026',
    );
    await userEvent.click(screen.getByRole('combobox', { name: FILTER_LABELS.category }));
    await userEvent.click(screen.getByRole('option', { name: 'Direção imprudente na carona' }));
    await userEvent.click(screen.getByRole('combobox', { name: FILTER_LABELS.status }));
    await userEvent.click(screen.getByRole('option', { name: 'Aberta' }));
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() => expect(asked.at(-1)).toContain('category=RecklessDriving'));
    expect(asked.at(-1)).toContain('status=Open');
    expect(asked.at(-1)).toContain('dateFrom=2026-09-01');
    expect(asked.at(-1)).toContain('dateTo=2026-09-30');
  });
});
