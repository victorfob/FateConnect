import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { RideTypeEnum, type Ride } from '@app/services/rides/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { DELETE_DIALOG } from './components/RideCard/RideDeleteConfirmation/constants';
import { CONTACT_DIALOG } from './components/RideCard/RideDriverContact/constants';
import {
  FILTER_LABELS,
  FILTER_PANEL_TITLE,
  FILTER_SUBMIT_LABEL,
} from './components/RideFilter/constants';
import { EDIT_MODE, OFFER_MODE, RIDE_FORM_LABELS } from './components/RideFormDialog/constants';
import { RIDE_DRIVER } from './helpers/rideDriver';
import * as C from './constants';
import { Rides } from '.';

const RIDES_URL = 'https://rides.fateconnect.test/caronas';

/** Cobre a tentativa inicial, os 2s de espera e a repetição. */
const RETRY_WINDOW_MS = 5000;

const RIDE: Ride = {
  id: 'b1b0f5b4-7a6f-4f1e-9d3a-2f5c8e4a1d70',
  qtdVagas: 3,
  destino: 'Fatec Sorocaba',
  dataPartida: '2026-05-22T00:00:00',
  horaPartida: '07:30:00',
  dataCadastro: '2026-05-01T00:00:00',
  tipoCarona: RideTypeEnum.PHILANTHROPIC,
  descricao: 'Saída do centro, com parada no terminal.',
  ativo: true,
};

function listReturning(rides: Ride[], onRequest?: (url: URL) => void) {
  server.use(
    http.get(RIDES_URL, ({ request }) => {
      onRequest?.(new URL(request.url));

      return HttpResponse.json(rides);
    }),
  );
}

function renderComponent() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.RIDES, element: <Rides /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.RIDES] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('Rides', () => {
  // O jsdom não implementa a área de transferência; os casos de cópia observam
  // esta escrita, e a instância nasce a cada caso para a rejeição não vazar.
  let clipboardWrite: Mock;

  beforeEach(() => {
    listReturning([]);
    clipboardWrite = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWrite },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  it('should render the title and the way back to the menu', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.RIDES_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: C.BACK_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });

  it('should open on the search tab, with the offer dialog closed', () => {
    renderComponent();

    expect(screen.getByRole('tab', { name: C.SEARCH_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: C.OFFER_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.queryByRole('heading', { name: OFFER_MODE.title })).not.toBeInTheDocument();
  });

  it('should open the offer dialog from the tab, without leaving the route', async () => {
    const router = renderComponent();

    await userEvent.click(screen.getByRole('tab', { name: C.OFFER_TAB_LABEL }));

    expect(await screen.findByRole('heading', { name: OFFER_MODE.title })).toBeInTheDocument();
    // O diálogo é modal e esconde a página atrás dele da árvore de
    // acessibilidade: a aba só é alcançável com `hidden`. O destaque dela é
    // visual enquanto o diálogo cobre a tela.
    expect(screen.getByRole('tab', { name: C.OFFER_TAB_LABEL, hidden: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES);
  });

  it('should hand the highlight back to the search tab when the dialog is dismissed', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('tab', { name: C.OFFER_TAB_LABEL }));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: C.SEARCH_TAB_LABEL })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
  });

  it('should show the rides the list returns', async () => {
    listReturning([RIDE]);
    renderComponent();

    expect(await screen.findByText(RIDE.destino)).toBeInTheDocument();
    expect(screen.getByText('22/05/2026')).toBeInTheDocument();
    expect(screen.getByText('07:30')).toBeInTheDocument();
    expect(screen.getByText(C.seatsLabel(RIDE.qtdVagas))).toBeInTheDocument();
    // A etiqueta existe duas vezes: uma no cabeçalho e outra no rodapé do
    // cartão, alternadas por media query — que o jsdom não avalia.
    expect(screen.getAllByText('Solidária')).toHaveLength(2);
  });

  it('should tell the user when no ride matches', async () => {
    renderComponent();

    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should report a failure to load the list, only once', async () => {
    server.use(http.get(RIDES_URL, () => new HttpResponse(null, { status: 500 })));
    renderComponent();

    // O cliente tenta a requisição de novo antes de desistir.
    expect(
      await screen.findByText(C.RIDE_LIST_MESSAGES.loadFailed, undefined, {
        timeout: RETRY_WINDOW_MS,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  // Sem endereço de API a requisição cai no servidor de desenvolvimento, que
  // responde o HTML da aplicação com status 200. Antes de validar o formato, a
  // tela recebia texto no lugar da lista e quebrava no `map`.
  it('should notify instead of breaking when the api does not return a list', async () => {
    server.use(http.get(RIDES_URL, () => HttpResponse.text('<!doctype html><html></html>')));

    renderComponent();

    const notice = await screen.findByText(C.RIDE_LIST_MESSAGES.loadFailed, undefined, {
      timeout: RETRY_WINDOW_MS,
    });

    expect(notice).toBeInTheDocument();
    expect(screen.getByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should build the request from the filters', async () => {
    let requestUrl: URL | undefined;
    listReturning([], (url) => {
      requestUrl = url;
    });
    renderComponent();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.type(screen.getByLabelText(FILTER_LABELS.destination), 'Sorocaba');
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() => expect(requestUrl?.searchParams.get('Destino')).toBe('Sorocaba'));
    // O ponto do painel não tem papel de acessibilidade: chega-se a ele pelo título.
    const activeDot = screen
      .getByText(FILTER_PANEL_TITLE)
      .closest('.MuiBadge-root')
      ?.querySelector('.MuiBadge-badge');
    expect(activeDot).not.toHaveClass('MuiBadge-invisible');
  });

  it('should ask for confirmation before deleting and keep the ride when it is refused', async () => {
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.delete }));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByRole('heading', { name: DELETE_DIALOG.title })).toBeInTheDocument();
    expect(dialog.getByText(RIDE.destino)).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: DELETE_DIALOG.cancelLabel }));

    // O cartão só volta a ser alcançável quando o diálogo termina de fechar.
    expect(within(await screen.findByRole('article')).getByText(RIDE.destino)).toBeInTheDocument();
  });

  it('should delete the ride once the removal is confirmed', async () => {
    let deleted = false;
    server.use(
      http.get(RIDES_URL, () => HttpResponse.json(deleted ? [] : [RIDE])),
      http.delete(`${RIDES_URL}/:rideId`, () => {
        deleted = true;

        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.delete }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: DELETE_DIALOG.confirmLabel }));

    expect(await screen.findByText(C.RIDE_LIST_MESSAGES.deleteSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should report a failure to delete', async () => {
    listReturning([RIDE]);
    server.use(http.delete(`${RIDES_URL}/:rideId`, () => new HttpResponse(null, { status: 500 })));
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.delete }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: DELETE_DIALOG.confirmLabel }));

    expect(await screen.findByText(C.RIDE_LIST_MESSAGES.deleteFailed)).toBeInTheDocument();
  });

  it('should show the contact of whoever offered the ride', async () => {
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(RIDE_DRIVER.name)).toBeInTheDocument();
    expect(dialog.getByRole('button', { name: `Copiar ${RIDE_DRIVER.email}` })).toBeInTheDocument();
  });

  it('should copy the email and say so', async () => {
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: `Copiar ${RIDE_DRIVER.email}` }));

    expect(await screen.findByText(CONTACT_DIALOG.emailCopied)).toBeInTheDocument();
    expect(clipboardWrite).toHaveBeenCalledWith(RIDE_DRIVER.email);
  });

  it('should report a refused copy instead of claiming success', async () => {
    // O navegador nega a escrita fora de contexto seguro ou sem permissão.
    clipboardWrite.mockRejectedValueOnce(new Error('denied'));
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: `Copiar ${RIDE_DRIVER.email}` }));

    expect(await screen.findByText(CONTACT_DIALOG.emailCopyFailed)).toBeInTheDocument();
  });

  it('should open the conversation already mentioning the destination of the ride', async () => {
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));

    const dialog = within(await screen.findByRole('dialog'));
    const conversation = dialog.getByRole('link', { name: RIDE_DRIVER.phone });

    expect(conversation).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent(RIDE.destino)),
    );
  });

  it('should give the card back when the contact is dismissed', async () => {
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));
    await screen.findByRole('dialog');

    // Por tecla, e não pelo botão: o caso é sobre o cartão voltar quando o
    // diálogo fecha, seja qual for o gesto que o fechou.
    await userEvent.keyboard('{Escape}');

    expect(within(await screen.findByRole('article')).getByText(RIDE.destino)).toBeInTheDocument();
  });

  it('should not offer contact on a ride offered by the logged user', async () => {
    tokenStorage.save('token', RIDE_DRIVER.name);
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    expect(
      screen.queryByRole('button', { name: C.RIDE_CARD_LABELS.contact }),
    ).not.toBeInTheDocument();
  });

  it('should open the edit dialog filled with the ride, without lighting the offer tab', async () => {
    listReturning([RIDE]);
    renderComponent();
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.edit }));

    expect(await screen.findByRole('heading', { name: EDIT_MODE.title })).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: new RegExp(RIDE_FORM_LABELS.destination) }),
    ).toHaveValue(RIDE.destino);
    expect(screen.getByRole('tab', { name: C.OFFER_TAB_LABEL, hidden: true })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});
