import { createMemoryRouter, RouterProvider } from 'react-router';
import { FILTER_CLEAR_LABEL, FILTER_SUBMIT_LABEL, FILTER_TITLE_PLURAL } from '@design-system';
import { http, HttpResponse } from 'msw';

import { CONTACT_LABEL } from '@app/components/ContactButton/constants';
import { VIEW_PHOTO_LABEL } from '@app/components/PhotoViewer/constants';
import { REPORT_CARD_MARKERS } from '@app/components/ReportCard/constants';
import { server } from '@app/mocks/server';
import { reportCategoryLabel } from '@app/pages/Reports/helpers/reportCategory';
import { RoutePathEnum } from '@app/routes/paths';
import { ReportCategoryEnum, ReportStatusEnum, type Report } from '@app/services/reports/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { ADVANCE_ACTIONS } from './components/ReportAdvanceAction/constants';
import { DISMISS_LABEL } from './components/ReportDismissAction/constants';
import { FILTER_LABELS } from './components/ReportsFilter/constants';
import { STATUS_DIALOG } from './components/ReportStatusDialog/constants';
import * as C from './constants';
import { ReportsTab } from '.';

const REPORTS_URL = 'https://api.fateconnect.test/reports';

const OPEN_REPORT: Report = {
  id: 'a3f1c0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  category: ReportCategoryEnum.RECKLESS_DRIVING,
  description: 'Dirigiu acima da velocidade o trajeto inteiro.',
  imageUrl: null,
  thumbnailUrl: null,
  status: ReportStatusEnum.OPEN,
  user: {
    name: 'Maria da Silva',
    email: 'maria@aluno.test',
    phone: '15999998888',
    thumbnailUrl: null,
  },
  isAnonymous: false,
  createdAt: '2026-09-15T12:00:00',
};

const CONFIDENTIAL_REPORT: Report = {
  ...OPEN_REPORT,
  id: 'b4a2d1e3-6c4f-5b7d-8e92-1f3a6c2b4d05',
  status: ReportStatusEnum.RESOLVED,
  user: null,
  isAnonymous: true,
};

function advanceLabel(status: ReportStatusEnum): string {
  const action = ADVANCE_ACTIONS[status];
  if (!action) throw new Error(`Sem passo adiante para ${status}.`);

  return action.label;
}

function statusRequests(): unknown[] {
  const sent: unknown[] = [];
  server.use(
    http.patch(`${REPORTS_URL}/:id/status`, async ({ request }) => {
      sent.push(await request.json());

      return new HttpResponse(null, { status: 204 });
    }),
  );

  return sent;
}

function pageWith(items: Report[]) {
  return { items, page: 1, pageSize: 10, total: items.length, totalPages: 1 };
}

function listServing(items: Report[], onRequest?: (request: Request) => void) {
  server.use(
    http.get(REPORTS_URL, ({ request }) => {
      onRequest?.(request);

      return HttpResponse.json(pageWith(items));
    }),
  );
}

function renderTab(initialEntry: string = RoutePathEnum.MANAGEMENT) {
  const router = createMemoryRouter([{ path: RoutePathEnum.MANAGEMENT, element: <ReportsTab /> }], {
    initialEntries: [initialEntry],
  });
  render(<RouterProvider router={router} />);

  return router;
}

describe('ReportsTab', () => {
  it('should reach who reported, which only the management does', async () => {
    listServing([OPEN_REPORT]);

    renderTab();

    await userEvent.click(await screen.findByRole('button', { name: CONTACT_LABEL }));

    expect(screen.getByText('Maria da Silva')).toBeInTheDocument();
  });

  // O marcador de sigilo, na mesma fileira, já diz por que não há a quem escrever.
  it('should offer no contact when the report is confidential', async () => {
    listServing([CONFIDENTIAL_REPORT]);

    renderTab();

    expect(await screen.findByText(REPORT_CARD_MARKERS.confidential)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: CONTACT_LABEL })).not.toBeInTheDocument();
  });

  it('should draw the thumbnail of the attached photo on the card', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:https://fateconnect.test/foto');
    URL.revokeObjectURL = vi.fn();
    server.use(
      http.get(
        'https://api.fateconnect.test/Reports/a1f0/image/thumbnail',
        () => new HttpResponse('\x89PNG', { headers: { 'Content-Type': 'image/webp' } }),
      ),
    );
    listServing([
      {
        ...OPEN_REPORT,
        imageUrl: 'Reports/a1f0/image',
        thumbnailUrl: 'Reports/a1f0/image/thumbnail',
      },
    ]);

    renderTab();
    await screen.findByText(OPEN_REPORT.description);

    expect(await screen.findByRole('img')).toBeInTheDocument();
  });

  it('should open the original, not the thumbnail on the card', async () => {
    const asked: string[] = [];
    URL.createObjectURL = vi.fn(() => 'blob:https://fateconnect.test/foto');
    URL.revokeObjectURL = vi.fn();
    server.use(
      http.get('https://api.fateconnect.test/Reports/a1f0/image/thumbnail', () => {
        asked.push('miniatura');

        return new HttpResponse('\x89PNG', { headers: { 'Content-Type': 'image/webp' } });
      }),
      http.get('https://api.fateconnect.test/Reports/a1f0/image', () => {
        asked.push('original');

        return new HttpResponse('\x89PNG', { headers: { 'Content-Type': 'image/jpeg' } });
      }),
    );
    listServing([
      {
        ...OPEN_REPORT,
        imageUrl: 'Reports/a1f0/image',
        thumbnailUrl: 'Reports/a1f0/image/thumbnail',
      },
    ]);

    renderTab();
    await screen.findByRole('img');
    await userEvent.click(screen.getByRole('button', { name: VIEW_PHOTO_LABEL }));

    const dialog = screen.getByRole('dialog', {
      name: reportCategoryLabel(OPEN_REPORT.category),
    });
    expect(await within(dialog).findByRole('img')).toBeInTheDocument();
    expect(asked).toEqual(['miniatura', 'original']);
  });

  it.each([
    [ReportStatusEnum.OPEN, ReportStatusEnum.IN_REVIEW, ReportStatusEnum.RESOLVED],
    [ReportStatusEnum.IN_REVIEW, ReportStatusEnum.RESOLVED, ReportStatusEnum.IN_REVIEW],
  ])(
    'should offer the next step and the trash while the report is %s',
    async (status, next, other) => {
      listServing([{ ...OPEN_REPORT, status }]);

      renderTab();
      await screen.findByText(OPEN_REPORT.description);

      expect(screen.getByRole('button', { name: advanceLabel(next) })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: DISMISS_LABEL })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: advanceLabel(other) })).not.toBeInTheDocument();
    },
  );

  it.each([ReportStatusEnum.RESOLVED, ReportStatusEnum.DISMISSED])(
    'should offer no action at all once the report is %s',
    async (status) => {
      listServing([{ ...OPEN_REPORT, status }]);

      renderTab();
      await screen.findByText(OPEN_REPORT.description);

      expect(screen.getByRole('button', { name: CONTACT_LABEL })).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: advanceLabel(ReportStatusEnum.IN_REVIEW) }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: advanceLabel(ReportStatusEnum.RESOLVED) }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: DISMISS_LABEL })).not.toBeInTheDocument();
    },
  );

  it.each([
    [ReportStatusEnum.OPEN, advanceLabel(ReportStatusEnum.IN_REVIEW), ReportStatusEnum.IN_REVIEW],
    [
      ReportStatusEnum.IN_REVIEW,
      advanceLabel(ReportStatusEnum.RESOLVED),
      ReportStatusEnum.RESOLVED,
    ],
    [ReportStatusEnum.OPEN, DISMISS_LABEL, ReportStatusEnum.DISMISSED],
    [ReportStatusEnum.IN_REVIEW, DISMISS_LABEL, ReportStatusEnum.DISMISSED],
  ])('should ask before moving %s with "%s"', async (status, label, target) => {
    listServing([{ ...OPEN_REPORT, status }]);
    const sent = statusRequests();

    renderTab();
    await screen.findByText(OPEN_REPORT.description);
    await userEvent.click(screen.getByRole('button', { name: label }));

    const dialog = within(screen.getByRole('dialog', { name: label }));
    expect(dialog.getByText(STATUS_DIALOG.message)).toBeInTheDocument();
    expect(sent).toEqual([]);

    await userEvent.click(dialog.getByRole('button', { name: STATUS_DIALOG.confirmLabel }));

    await waitFor(() => expect(sent).toEqual([{ Status: target }]));
  });

  it.each([advanceLabel(ReportStatusEnum.IN_REVIEW), DISMISS_LABEL])(
    'should keep the report as it is when "%s" is dismissed',
    async (label) => {
      listServing([OPEN_REPORT]);
      const sent = statusRequests();

      renderTab();
      await screen.findByText(OPEN_REPORT.description);
      await userEvent.click(screen.getByRole('button', { name: label }));
      await userEvent.click(screen.getByRole('button', { name: STATUS_DIALOG.dismissLabel }));

      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: label })).not.toBeInTheDocument(),
      );
      expect(sent).toEqual([]);
    },
  );

  it('should ask for the dismissal in red, with the trash over the message', async () => {
    listServing([OPEN_REPORT]);

    renderTab();
    await screen.findByText(OPEN_REPORT.description);
    await userEvent.click(screen.getByRole('button', { name: DISMISS_LABEL }));

    const dialog = within(screen.getByRole('dialog', { name: DISMISS_LABEL }));
    expect(dialog.getByTestId('DeleteOutlinedIcon')).toBeInTheDocument();
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
