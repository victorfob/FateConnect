import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import {
  DenunciationCategoryEnum,
  DenunciationStatusEnum,
  type Denunciation,
} from '@app/services/denunciations/types';
import { screen, userEvent, waitFor } from '@app/test/testing-library';
import { pagedListHandler } from '@app/test/utils/pagedList';
import { renderAtRoute } from '@app/test/utils/renderAtRoute';

import {
  DENUNCIATION_CARD_MARKERS,
  DESCRIPTION_TOGGLE_LABELS,
} from './components/DenunciationCard/constants';
import {
  DENUNCIATION_STATUS_FILTER_OPTIONS,
  FILTER_CLEAR_LABEL,
  FILTER_LABELS,
  FILTER_SUBMIT_LABEL,
  FILTER_TITLE,
} from './components/DenunciationFilter/constants';
import { DENUNCIATION_FORM } from './components/DenunciationFormDialog/constants';
import * as C from './constants';
import { Denunciations } from '.';

const DENUNCIATIONS_URL = 'https://api.fateconnect.test/denunciations';

const CREATED = 201;
const SERVER_ERROR = 500;
const SECOND_PAGE = 2;
const SINGLE_NOTICE = 1;
const TWO_PAGES_OF_ITEMS = 12;

/** O cliente repete a requisição antes de desistir, e o aviso só sai no fim. */
const RETRY_WINDOW_MS = 5000;

const DENUNCIATION: Denunciation = {
  id: 'a1f0d2c4-5b3e-4a6c-9f81-7d2e5b0a3c14',
  category: DenunciationCategoryEnum.RECKLESS_DRIVING,
  description: 'A pessoa dirigiu acima da velocidade no trajeto inteiro.',
  imageUrl: null,
  hasImage: false,
  status: DenunciationStatusEnum.OPEN,
  user: null,
  isAnonymous: false,
  createdAt: '2026-09-10T13:00:00Z',
};

function denunciationWith(overrides: Partial<Denunciation>): Denunciation {
  return { ...DENUNCIATION, ...overrides, id: `${DENUNCIATION.id}-${overrides.status ?? 'x'}` };
}

const OVERFLOWING_HEIGHT = 200;
const VISIBLE_HEIGHT = 48;

/**
 * O jsdom não faz layout: as duas alturas respondem zero, e o cartão conclui que
 * a descrição coube. Forjá-las é o que põe o gatilho de expansão na tela.
 */
function stubOverflow() {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => OVERFLOWING_HEIGHT,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => VISIBLE_HEIGHT,
  });
}

const renderScreen = () => renderAtRoute(RoutePathEnum.DENUNCIATIONS, <Denunciations />);

function listing(all: Denunciation[], onRequest?: (url: URL) => void) {
  server.use(pagedListHandler(DENUNCIATIONS_URL, all, onRequest));
}

const statusOptionLabel = (status: DenunciationStatusEnum) =>
  DENUNCIATION_STATUS_FILTER_OPTIONS.find((option) => option.value === status)!.label;

describe('Denunciations', () => {
  beforeEach(() => {
    listing([]);
  });

  // As alturas forjadas são do protótipo do elemento: sem devolvê-las, o caso
  // seguinte mede um mundo em que todo texto transborda.
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
    Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
  });

  it('should name the screen, explain the channel and offer the way back', () => {
    renderScreen();

    expect(screen.getByRole('heading', { name: C.DENUNCIATIONS_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: C.DENUNCIATIONS_INTRO.title })).toBeInTheDocument();
    expect(screen.getByText(C.DENUNCIATIONS_INTRO.description)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: C.LIST_SECTION_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: C.BACK_LABEL })).toBeInTheDocument();
  });

  it('should open the form from the card, and only from it', async () => {
    renderScreen();

    expect(
      screen.queryByRole('heading', { name: DENUNCIATION_FORM.title }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: C.DENUNCIATIONS_INTRO.action }));

    expect(
      await screen.findByRole('heading', { name: DENUNCIATION_FORM.title }),
    ).toBeInTheDocument();
  });

  it('should close the form and leave the card in place', async () => {
    renderScreen();
    await userEvent.click(screen.getByRole('button', { name: C.DENUNCIATIONS_INTRO.action }));
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: DENUNCIATION_FORM.title }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: C.DENUNCIATIONS_INTRO.action })).toBeInTheDocument();
  });

  it('should list what the person sent, with the situation of each one', async () => {
    listing([DENUNCIATION]);
    renderScreen();

    expect(await screen.findByText(DENUNCIATION.description)).toBeInTheDocument();
    expect(screen.getByText('Direção imprudente na carona')).toBeInTheDocument();
    expect(screen.getByText('10/09/2026')).toBeInTheDocument();
    expect(screen.getByText(statusOptionLabel(DenunciationStatusEnum.OPEN))).toBeInTheDocument();
  });

  it('should mark the confidential one and the one with a photo', async () => {
    listing([denunciationWith({ isAnonymous: true, hasImage: true })]);
    renderScreen();

    expect(await screen.findByText(DENUNCIATION_CARD_MARKERS.confidential)).toBeInTheDocument();
    expect(screen.getByText(DENUNCIATION_CARD_MARKERS.photo)).toBeInTheDocument();
  });

  it('should leave both markers out of a denunciation that has neither', async () => {
    listing([DENUNCIATION]);
    renderScreen();
    await screen.findByText(DENUNCIATION.description);

    expect(screen.queryByText(DENUNCIATION_CARD_MARKERS.confidential)).not.toBeInTheDocument();
    expect(screen.queryByText(DENUNCIATION_CARD_MARKERS.photo)).not.toBeInTheDocument();
  });

  it('should say what the empty list would hold, and how to fill it', async () => {
    renderScreen();

    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should ask the api for the chosen situation, and keep it in the address', async () => {
    const asked: URL[] = [];
    listing([DENUNCIATION], (url) => asked.push(url));
    renderScreen();
    await screen.findByText(DENUNCIATION.description);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE }));
    await userEvent.click(await screen.findByRole('combobox', { name: FILTER_LABELS.status }));
    await userEvent.click(
      await screen.findByRole('option', {
        name: statusOptionLabel(DenunciationStatusEnum.RESOLVED),
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() =>
      expect(asked.at(-1)?.searchParams.get('status')).toBe(DenunciationStatusEnum.RESOLVED),
    );
  });

  it('should go back to every situation when the filter is cleared', async () => {
    const asked: URL[] = [];
    listing([DENUNCIATION], (url) => asked.push(url));
    renderScreen();
    await screen.findByText(DENUNCIATION.description);

    await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE }));
    await userEvent.click(await screen.findByRole('combobox', { name: FILTER_LABELS.status }));
    await userEvent.click(
      await screen.findByRole('option', {
        name: statusOptionLabel(DenunciationStatusEnum.RESOLVED),
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));
    await waitFor(() => expect(asked.at(-1)?.searchParams.get('status')).not.toBeNull());

    // O gatilho só volta a ser alcançável quando o diálogo termina de sair.
    await userEvent.click(await screen.findByRole('button', { name: FILTER_TITLE }));
    await userEvent.click(await screen.findByRole('button', { name: FILTER_CLEAR_LABEL }));

    await waitFor(() => expect(asked.at(-1)?.searchParams.get('status')).toBeNull());
  });

  it('should ask the api for the page the person moved to', async () => {
    const asked: URL[] = [];
    const twoPages = Array.from({ length: TWO_PAGES_OF_ITEMS }, (_, index) => ({
      ...DENUNCIATION,
      id: `${DENUNCIATION.id}-${index}`,
      description: `Relato número ${index}`,
    }));
    listing(twoPages, (url) => asked.push(url));
    renderScreen();
    await screen.findByText('Relato número 0');

    await userEvent.click(screen.getByRole('button', { name: `Ir para a página ${SECOND_PAGE}` }));

    await waitFor(() => expect(asked.at(-1)?.searchParams.get('page')).toBe(String(SECOND_PAGE)));
  });

  it('should refresh the list once the denunciation is sent', async () => {
    const asked: URL[] = [];
    listing([], (url) => asked.push(url));
    server.use(
      http.post(DENUNCIATIONS_URL, () => HttpResponse.json({ id: 'nova' }, { status: CREATED })),
    );
    renderScreen();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);
    const askedBefore = asked.length;

    await userEvent.click(screen.getByRole('button', { name: C.DENUNCIATIONS_INTRO.action }));
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });
    await userEvent.click(screen.getByRole('combobox', { name: /Motivo/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Cadastro falso de item' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: /Descrição/ }),
      'O item cadastrado não existe e o anúncio é falso.',
    );
    await userEvent.click(screen.getByRole('button', { name: DENUNCIATION_FORM.submitLabel }));

    await waitFor(() => expect(asked.length).toBeGreaterThan(askedBefore));
  });

  it('should keep the list readable when the api refuses it', async () => {
    server.use(http.get(DENUNCIATIONS_URL, () => new HttpResponse(null, { status: SERVER_ERROR })));
    renderScreen();

    // O cliente tenta a requisição de novo antes de desistir.
    expect(
      await screen.findByText(C.DENUNCIATION_LIST_MESSAGES.loadFailed, undefined, {
        timeout: RETRY_WINDOW_MS,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(SINGLE_NOTICE);
  });

  it('should offer the expansion only when the description does not fit', async () => {
    stubOverflow();
    listing([DENUNCIATION]);
    renderScreen();
    await screen.findByText(DENUNCIATION.description);

    const toggle = await screen.findByRole('button', {
      name: DESCRIPTION_TOGGLE_LABELS.expand,
    });
    await userEvent.click(toggle);

    expect(
      await screen.findByRole('button', { name: DESCRIPTION_TOGGLE_LABELS.collapse }),
    ).toBeInTheDocument();
  });

  it('should leave the expansion out when the description already fits', async () => {
    listing([DENUNCIATION]);
    renderScreen();
    await screen.findByText(DENUNCIATION.description);

    expect(
      screen.queryByRole('button', { name: DESCRIPTION_TOGGLE_LABELS.expand }),
    ).not.toBeInTheDocument();
  });
});
