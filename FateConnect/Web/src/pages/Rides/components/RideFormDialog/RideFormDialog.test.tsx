import { format } from 'date-fns';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { toApiDate } from '@app/pages/Rides/helpers/apiDate';
import { type Ride, type RideInput, RideTypeEnum } from '@app/services/rides/types';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';

import { EDIT_MODE, OFFER_MODE, RIDE_FORM_LABELS } from './constants';
import { RideFormDialog, type RideFormDialogProps } from '.';

const RIDES_URL = 'https://rides.fateconnect.test/caronas';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_AHEAD = 30;

const OFFERED_AT = new Date(Date.now() + DAYS_AHEAD * DAY_MS);
/** O seletor do MUI recebe a data seção a seção, na ordem de pt-BR. */
const TYPED_DATE = format(OFFERED_AT, 'ddMMyyyy');

const RIDE: Ride = {
  id: 'b1b0f5b4-7a6f-4f1e-9d3a-2f5c8e4a1d70',
  qtdVagas: 4,
  destino: 'Fatec Sorocaba',
  dataPartida: toApiDate(new Date(Date.now() + DAYS_AHEAD * DAY_MS)),
  horaPartida: '07:30:00',
  dataCadastro: '2026-05-01T00:00:00',
  tipoCarona: RideTypeEnum.EGALITARIAN,
  descricao: 'Saída do centro, com parada no terminal.',
  ativo: true,
};

const onClose = vi.fn();

const DEFAULT_PROPS: RideFormDialogProps = { open: true, onClose, ride: undefined };

const renderComponent = (props = DEFAULT_PROPS) => render(<RideFormDialog {...props} />);

const destinationField = () =>
  screen.getByRole('textbox', { name: new RegExp(RIDE_FORM_LABELS.destination) });

describe('RideFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should offer a ride when it gets no ride to edit', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: OFFER_MODE.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: OFFER_MODE.submitLabel })).toBeInTheDocument();
    expect(destinationField()).toHaveValue('');
  });

  it('should edit the ride it gets, already filled in', async () => {
    renderComponent({ ...DEFAULT_PROPS, ride: RIDE });

    expect(await screen.findByRole('heading', { name: EDIT_MODE.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: EDIT_MODE.submitLabel })).toBeInTheDocument();
    expect(destinationField()).toHaveValue(RIDE.destino);
    expect(
      screen.getByRole('textbox', { name: new RegExp(RIDE_FORM_LABELS.description) }),
    ).toHaveValue(RIDE.descricao);
  });

  it('should refuse to submit an empty form and say what is missing', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    let requested = false;
    server.use(
      http.post(RIDES_URL, () => {
        requested = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: OFFER_MODE.submitLabel }));

    expect(await screen.findByText(/destino deve ter ao menos/i)).toBeInTheDocument();
    expect(requested).toBe(false);
  });

  it('should send the whole ride on update, so the description survives', async () => {
    let body: RideInput | null = null;
    server.use(
      http.put(`${RIDES_URL}/:id`, async ({ request }) => {
        body = (await request.json()) as RideInput;
        return HttpResponse.json({ id: RIDE.id });
      }),
    );
    renderComponent({ ...DEFAULT_PROPS, ride: RIDE });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      qtdVagas: RIDE.qtdVagas,
      destino: RIDE.destino,
      dataPartida: RIDE.dataPartida,
      horaPartida: '07:30',
      tipoCarona: RIDE.tipoCarona,
      descricao: RIDE.descricao,
    });
  });

  it('should keep the dialog open when the api fails, with what was typed', async () => {
    server.use(http.put(`${RIDES_URL}/:id`, () => new HttpResponse(null, { status: 500 })));
    renderComponent({ ...DEFAULT_PROPS, ride: RIDE });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    expect(await screen.findByText(EDIT_MODE.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(destinationField()).toHaveValue(RIDE.destino);
  });

  it('should offer the ride the form describes', async () => {
    let body: RideInput | null = null;
    server.use(
      http.post(RIDES_URL, async ({ request }) => {
        body = (await request.json()) as RideInput;
        return HttpResponse.json({ id: 'new' }, { status: 201 });
      }),
    );
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });

    await userEvent.type(destinationField(), 'Terminal Santo Antônio');
    await userEvent.click(
      screen.getByRole('group', { name: new RegExp(RIDE_FORM_LABELS.departureDate) }),
    );
    await userEvent.keyboard(TYPED_DATE);
    await userEvent.type(
      screen.getByLabelText(new RegExp(RIDE_FORM_LABELS.departureTime)),
      '18:30',
    );
    await userEvent.click(
      screen.getByRole('combobox', { name: new RegExp(RIDE_FORM_LABELS.rideType) }),
    );
    await userEvent.click(await screen.findByRole('option', { name: 'Solidária' }));
    await userEvent.click(
      screen.getByRole('combobox', { name: new RegExp(RIDE_FORM_LABELS.seats) }),
    );
    await userEvent.click(await screen.findByRole('option', { name: '3 vagas' }));

    await userEvent.click(screen.getByRole('button', { name: OFFER_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      qtdVagas: 3,
      destino: 'Terminal Santo Antônio',
      dataPartida: toApiDate(OFFERED_AT),
      horaPartida: '18:30',
      tipoCarona: RideTypeEnum.PHILANTHROPIC,
      descricao: '',
    });
  });
});
