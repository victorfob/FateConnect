import { http, HttpResponse } from 'msw';
import type { Mock } from 'vitest';

import { server } from '@app/mocks/server';
import { tokenStorage } from '@app/services/auth/tokenStorage';
import { RideTypeEnum } from '@app/services/rides/types';
import type { Ride } from '@app/services/rides/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { FILTER_LABELS, FILTER_SUBMIT_LABEL } from '../../components/RideFilter/constants';
import { RIDE_DRIVER } from '../../helpers/rideDriver';
import * as C from '../../constants';
import { SearchRide } from '.';

const RIDES_URL = 'https://rides.fateconnect.test/caronas';

const RIDE: Ride = {
  id: 7,
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

describe('SearchRide', () => {
  // O jsdom não implementa a área de transferência; os casos de cópia observam
  // esta escrita, e a instância nasce a cada caso para a rejeição não vazar.
  let clipboardWrite: Mock;

  beforeEach(() => {
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

  it('should show the rides the list returns', async () => {
    listReturning([RIDE]);
    render(<SearchRide />);

    expect(await screen.findByText(RIDE.destino)).toBeInTheDocument();
    expect(screen.getByText('22/05/2026')).toBeInTheDocument();
    expect(screen.getByText('07:30')).toBeInTheDocument();
    expect(screen.getByText(C.seatsLabel(RIDE.qtdVagas))).toBeInTheDocument();
    // A etiqueta existe duas vezes: uma no cabeçalho e outra no rodapé do
    // cartão, alternadas por media query — que o jsdom não avalia.
    expect(screen.getAllByText('Filantrópica')).toHaveLength(2);
  });

  it('should tell the user when no ride matches', async () => {
    listReturning([]);
    render(<SearchRide />);

    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should report a failure to load the list', async () => {
    server.use(http.get(RIDES_URL, () => new HttpResponse(null, { status: 500 })));
    render(<SearchRide />);

    // O cliente tenta a requisição de novo antes de desistir.
    expect(
      await screen.findByText(C.RIDE_LIST_MESSAGES.loadFailed, undefined, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('should report a load failure only once', async () => {
    server.use(http.get(RIDES_URL, () => new HttpResponse(null, { status: 500 })));
    render(<SearchRide />);

    await screen.findByText(C.RIDE_LIST_MESSAGES.loadFailed, undefined, { timeout: 5000 });

    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('should build the request from the filters', async () => {
    let requestUrl: URL | undefined;
    listReturning([], (url) => {
      requestUrl = url;
    });
    render(<SearchRide />);
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.type(screen.getByLabelText(FILTER_LABELS.destination), 'Sorocaba');
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() => expect(requestUrl?.searchParams.get('Destino')).toBe('Sorocaba'));
  });

  it('should ask for confirmation before deleting and keep the ride when it is refused', async () => {
    listReturning([RIDE]);
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.delete }));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByRole('heading', { name: C.DELETE_DIALOG.title })).toBeInTheDocument();
    expect(dialog.getByText(RIDE.destino)).toBeInTheDocument();

    await userEvent.click(dialog.getByRole('button', { name: C.DELETE_DIALOG.cancelLabel }));

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
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.delete }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: C.DELETE_DIALOG.confirmLabel }));

    expect(await screen.findByText(C.RIDE_LIST_MESSAGES.deleteSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should report a failure to delete', async () => {
    listReturning([RIDE]);
    server.use(http.delete(`${RIDES_URL}/:rideId`, () => new HttpResponse(null, { status: 500 })));
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.delete }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: C.DELETE_DIALOG.confirmLabel }));

    expect(await screen.findByText(C.RIDE_LIST_MESSAGES.deleteFailed)).toBeInTheDocument();
  });

  it('should show the contact of whoever offered the ride', async () => {
    listReturning([RIDE]);
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText(RIDE_DRIVER.name)).toBeInTheDocument();
    expect(dialog.getByRole('button', { name: `Copiar ${RIDE_DRIVER.email}` })).toBeInTheDocument();
  });

  it('should copy the email and say so', async () => {
    listReturning([RIDE]);
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: `Copiar ${RIDE_DRIVER.email}` }));

    expect(await screen.findByText(C.CONTACT_DIALOG.emailCopied)).toBeInTheDocument();
    expect(clipboardWrite).toHaveBeenCalledWith(RIDE_DRIVER.email);
  });

  it('should report a refused copy instead of claiming success', async () => {
    // O navegador nega a escrita fora de contexto seguro ou sem permissão.
    clipboardWrite.mockRejectedValueOnce(new Error('denied'));
    listReturning([RIDE]);
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.contact }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: `Copiar ${RIDE_DRIVER.email}` }));

    expect(await screen.findByText(C.CONTACT_DIALOG.emailCopyFailed)).toBeInTheDocument();
  });

  it('should open the conversation already mentioning the destination of the ride', async () => {
    listReturning([RIDE]);
    render(<SearchRide />);
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
    render(<SearchRide />);
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
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    expect(
      screen.queryByRole('button', { name: C.RIDE_CARD_LABELS.contact }),
    ).not.toBeInTheDocument();
  });

  it('should announce that editing is not available yet', async () => {
    listReturning([RIDE]);
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.edit }));

    expect(await screen.findByText(C.RIDE_LIST_MESSAGES.editSoon)).toBeInTheDocument();
  });
});
