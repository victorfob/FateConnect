import { FILTER_CLEAR_LABEL, FILTER_SUBMIT_LABEL, FILTER_TITLE_SINGULAR } from '@design-system';
import { http, HttpResponse } from 'msw';

import { BACK_TO_MENU_LABEL } from '@app/components/BackToMenu/constants';
import { VIEW_PHOTO_LABEL } from '@app/components/PhotoViewer/constants';
import { photoAlt, REPORT_CARD_MARKERS } from '@app/components/ReportCard/constants';
import { DESCRIPTION_TOGGLE_LABELS } from '@app/constants/cardDescription';
import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { ReportCategoryEnum, ReportStatusEnum, type Report } from '@app/services/reports/types';
import { screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { forgeOverflow, restoreContentHeight } from '@app/test/utils/contentHeight';
import { pagedListHandler } from '@app/test/utils/pagedList';
import { renderAtRoute } from '@app/test/utils/renderAtRoute';

import { FILTER_LABELS, REPORT_STATUS_FILTER_OPTIONS } from './components/ReportFilter/constants';
import { CHANNEL_NOTE, REPORT_FORM } from './components/ReportFormDialog/constants';
import { reportCategoryLabel } from './helpers/reportCategory';
import * as C from './constants';
import { Reports } from '.';

const REPORTS_URL = 'https://api.fateconnect.test/reports';

const MY_REPORTS_URL = `${REPORTS_URL}/mine`;

const PHOTO_PATH = 'Reports/a1f0/image';
const THUMBNAIL_PATH = `${PHOTO_PATH}/thumbnail`;
const THUMBNAIL_URL = `https://api.fateconnect.test/${THUMBNAIL_PATH}`;
const OBJECT_URL = 'blob:https://fateconnect.test/foto';
/** Basta ser corpo binário: o que a tela usa é o blob que o cliente devolve. */
const PNG_BYTES = '\x89PNG\r\n\x1a\n';

const CREATED = 201;
const SERVER_ERROR = 500;
const SECOND_PAGE = 2;
const SINGLE_NOTICE = 1;
const TWO_PAGES_OF_ITEMS = 12;

/** O cliente repete a requisição antes de desistir, e o aviso só sai no fim. */
const RETRY_WINDOW_MS = 5000;

const REPORT: Report = {
  id: 'a1f0d2c4-5b3e-4a6c-9f81-7d2e5b0a3c14',
  category: ReportCategoryEnum.RECKLESS_DRIVING,
  description: 'A pessoa dirigiu acima da velocidade no trajeto inteiro.',
  imageUrl: null,
  thumbnailUrl: null,
  status: ReportStatusEnum.OPEN,
  user: null,
  isAnonymous: false,
  createdAt: '2026-09-10T13:00:00Z',
};

function reportWith(overrides: Partial<Report>): Report {
  return { ...REPORT, ...overrides, id: `${REPORT.id}-${overrides.status ?? 'x'}` };
}

const renderScreen = () => renderAtRoute(RoutePathEnum.REPORTS, <Reports />);

function listing(all: Report[], onRequest?: (url: URL) => void) {
  server.use(pagedListHandler(MY_REPORTS_URL, all, onRequest));
}

const statusOptionLabel = (status: ReportStatusEnum) =>
  REPORT_STATUS_FILTER_OPTIONS.find((option) => option.value === status)!.label;

describe('Reports', () => {
  beforeEach(() => {
    listing([]);
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a foto.
    URL.createObjectURL = vi.fn(() => OBJECT_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    restoreContentHeight();
  });

  it('should name the screen, offer the two tabs and the way back', () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: C.REPORTS_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: C.LIST_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: C.SEND_TAB_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: BACK_TO_MENU_LABEL })).toBeInTheDocument();
  });

  it('should open the form from the tab, and explain the channel inside it', async () => {
    renderScreen();

    expect(screen.queryByRole('heading', { name: REPORT_FORM.title })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: C.SEND_TAB_LABEL }));

    expect(await screen.findByRole('heading', { name: REPORT_FORM.title })).toBeInTheDocument();
    expect(screen.getByText(CHANNEL_NOTE)).toBeInTheDocument();
  });

  it('should close the form and select the list tab again', async () => {
    renderScreen();
    await userEvent.click(screen.getByRole('tab', { name: C.SEND_TAB_LABEL }));
    await screen.findByRole('heading', { name: REPORT_FORM.title });

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: REPORT_FORM.title })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('tab', { name: C.LIST_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('should list what the person sent, with the situation of each one', async () => {
    listing([REPORT]);
    renderScreen();

    expect(await screen.findByText(REPORT.description)).toBeInTheDocument();
    expect(screen.getByText('Direção imprudente na carona')).toBeInTheDocument();
    expect(screen.getByText('10/09/2026')).toBeInTheDocument();
    expect(screen.getByText(statusOptionLabel(ReportStatusEnum.OPEN))).toBeInTheDocument();
  });

  it('should mark the confidential one', async () => {
    listing([reportWith({ isAnonymous: true })]);
    renderScreen();

    expect(await screen.findByText(REPORT_CARD_MARKERS.confidential)).toBeInTheDocument();
  });

  it('should ask the api for what the person reported, not for every report', async () => {
    const asked: URL[] = [];
    listing([REPORT], (url) => asked.push(url));
    renderScreen();
    await screen.findByText(REPORT.description);

    expect(asked.map((url) => url.pathname)).toEqual(['/reports/mine']);
  });

  it('should draw the attached photo on the card', async () => {
    listing([reportWith({ imageUrl: PHOTO_PATH, thumbnailUrl: THUMBNAIL_PATH })]);
    server.use(
      http.get(THUMBNAIL_URL, () => {
        return new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': 'image/png' } });
      }),
    );
    renderScreen();

    expect(await screen.findByRole('img', { name: photoAlt(REPORT) })).toHaveAttribute(
      'src',
      OBJECT_URL,
    );
  });

  it('should show the thumbnail and open the original in a dialog', async () => {
    const asked: string[] = [];
    listing([reportWith({ imageUrl: PHOTO_PATH, thumbnailUrl: THUMBNAIL_PATH })]);
    server.use(
      http.get(THUMBNAIL_URL, ({ request }) => {
        asked.push(new URL(request.url).pathname);

        return new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': 'image/webp' } });
      }),
      http.get(`https://api.fateconnect.test/${PHOTO_PATH}`, ({ request }) => {
        asked.push(new URL(request.url).pathname);

        return new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': 'image/jpeg' } });
      }),
    );
    renderScreen();
    await screen.findByRole('img', { name: photoAlt(REPORT) });

    expect(asked).toEqual([`/${THUMBNAIL_PATH}`]);

    await userEvent.click(screen.getByRole('button', { name: VIEW_PHOTO_LABEL }));

    const dialog = screen.getByRole('dialog', {
      name: reportCategoryLabel(REPORT.category),
    });
    expect(await within(dialog).findByRole('img', { name: photoAlt(REPORT) })).toBeInTheDocument();
    expect(asked).toEqual([`/${THUMBNAIL_PATH}`, `/${PHOTO_PATH}`]);
  });

  it('should leave the confidential marker out of a report that is not confidential', async () => {
    listing([REPORT]);
    renderScreen();
    await screen.findByText(REPORT.description);

    expect(screen.queryByText(REPORT_CARD_MARKERS.confidential)).not.toBeInTheDocument();
  });

  it('should say what the empty list would hold, and how to fill it', async () => {
    renderScreen();

    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should ask the api for the chosen situation, and keep it in the address', async () => {
    const asked: URL[] = [];
    listing([REPORT], (url) => asked.push(url));
    renderScreen();
    await screen.findByText(REPORT.description);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_SINGULAR }));
    await userEvent.click(await screen.findByRole('combobox', { name: FILTER_LABELS.status }));
    await userEvent.click(
      await screen.findByRole('option', {
        name: statusOptionLabel(ReportStatusEnum.RESOLVED),
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() =>
      expect(asked.at(-1)?.searchParams.get('status')).toBe(ReportStatusEnum.RESOLVED),
    );
  });

  it('should go back to every situation when the filter is cleared', async () => {
    const asked: URL[] = [];
    listing([REPORT], (url) => asked.push(url));
    renderScreen();
    await screen.findByText(REPORT.description);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE_SINGULAR }));
    await userEvent.click(await screen.findByRole('combobox', { name: FILTER_LABELS.status }));
    await userEvent.click(
      await screen.findByRole('option', {
        name: statusOptionLabel(ReportStatusEnum.RESOLVED),
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));
    await waitFor(() => expect(asked.at(-1)?.searchParams.get('status')).not.toBeNull());

    // O gatilho só volta a ser alcançável quando o diálogo termina de sair.
    await userEvent.click(await screen.findByRole('button', { name: FILTER_TITLE_SINGULAR }));
    await userEvent.click(await screen.findByRole('button', { name: FILTER_CLEAR_LABEL }));

    await waitFor(() => expect(asked.at(-1)?.searchParams.get('status')).toBeNull());
  });

  it('should ask the api for the page the person moved to', async () => {
    const asked: URL[] = [];
    const twoPages = Array.from({ length: TWO_PAGES_OF_ITEMS }, (_, index) => ({
      ...REPORT,
      id: `${REPORT.id}-${index}`,
      description: `Relato número ${index}`,
    }));
    listing(twoPages, (url) => asked.push(url));
    renderScreen();
    await screen.findByText('Relato número 0');

    await userEvent.click(screen.getByRole('button', { name: `Ir para a página ${SECOND_PAGE}` }));

    await waitFor(() => expect(asked.at(-1)?.searchParams.get('page')).toBe(String(SECOND_PAGE)));
  });

  it('should refresh the list once the report is sent', async () => {
    const asked: URL[] = [];
    listing([], (url) => asked.push(url));
    server.use(
      http.post(REPORTS_URL, () => HttpResponse.json({ id: 'nova' }, { status: CREATED })),
    );
    renderScreen();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);
    const askedBefore = asked.length;

    await userEvent.click(screen.getByRole('tab', { name: C.SEND_TAB_LABEL }));
    await screen.findByRole('heading', { name: REPORT_FORM.title });
    await userEvent.click(screen.getByRole('combobox', { name: /Motivo/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Cadastro falso de item' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: /Descrição/ }),
      'O item cadastrado não existe e o anúncio é falso.',
    );
    await userEvent.click(screen.getByRole('button', { name: REPORT_FORM.submitLabel }));

    await waitFor(() => expect(asked.length).toBeGreaterThan(askedBefore));
  });

  it('should keep the list readable when the api refuses it', async () => {
    server.use(http.get(MY_REPORTS_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    renderScreen();

    // O cliente tenta a requisição de novo antes de desistir.
    expect(
      await screen.findByText(C.REPORT_LIST_MESSAGES.loadFailed, undefined, {
        timeout: RETRY_WINDOW_MS,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(SINGLE_NOTICE);
  });

  it('should offer the expansion only when the description does not fit', async () => {
    forgeOverflow();
    listing([REPORT]);
    renderScreen();
    await screen.findByText(REPORT.description);

    const toggle = await screen.findByRole('button', {
      name: DESCRIPTION_TOGGLE_LABELS.expand,
    });
    await userEvent.click(toggle);

    expect(
      await screen.findByRole('button', { name: DESCRIPTION_TOGGLE_LABELS.collapse }),
    ).toBeInTheDocument();
  });

  it('should leave the expansion out when the description already fits', async () => {
    listing([REPORT]);
    renderScreen();
    await screen.findByText(REPORT.description);

    expect(
      screen.queryByRole('button', { name: DESCRIPTION_TOGGLE_LABELS.expand }),
    ).not.toBeInTheDocument();
  });
});
