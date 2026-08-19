import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@app/mocks/server';
import { RideTypeEnum } from '@app/services/rides/types';
import type { Ride } from '@app/services/rides/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { SearchRide } from '.';
import * as C from '../../constants';
import { FILTER_LABELS, FILTER_SUBMIT_LABEL } from '../../components/RideFilter/constants';

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

  it('should announce that editing is not available yet', async () => {
    listReturning([RIDE]);
    render(<SearchRide />);
    await screen.findByText(RIDE.destino);

    await userEvent.click(screen.getByRole('button', { name: C.RIDE_CARD_LABELS.edit }));

    expect(await screen.findByText(C.RIDE_LIST_MESSAGES.editSoon)).toBeInTheDocument();
  });
});
