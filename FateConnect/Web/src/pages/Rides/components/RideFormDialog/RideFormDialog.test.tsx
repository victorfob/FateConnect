import { DATE_TIME_PICKER_LABEL, onlyDigits } from '@design-system';
import { addDays, format } from 'date-fns';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RIDE_FREQUENCY_OPTIONS } from '@app/pages/Rides/helpers/rideFrequency';
import { RIDE_TYPE_HELP } from '@app/pages/Rides/helpers/rideType';
import {
  RideFrequencyEnum,
  RideTypeEnum,
  type Ride,
  type RideInput,
} from '@app/services/rides/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { toApiDate, toDisplayDate } from '@app/utils/apiDate';

import { EDIT_MODE, OFFER_MODE, RIDE_FORM_LABELS, RIDE_FORM_MESSAGES } from './constants';
import { RideFormDialog, type RideFormDialogProps } from '.';

const RIDES_URL = 'https://api.fateconnect.test/rides';
const HOLIDAYS_URL = 'https://api.fateconnect.test/holidays';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_AHEAD = 30;

const OFFERED_AT = new Date(Date.now() + DAYS_AHEAD * DAY_MS);
const OFFERED_HOUR = '18:30';
/** O campo é mascarado: chegam só os dígitos, do dia ao minuto. */
const TYPED_DEPARTURE = `${format(OFFERED_AT, 'ddMMyyyy')}${onlyDigits(OFFERED_HOUR)}`;

const RIDE: Ride = {
  id: 'b1b0f5b4-7a6f-4f1e-9d3a-2f5c8e4a1d70',
  destination: 'Fatec Sorocaba',
  departureDate: toApiDate(new Date(Date.now() + DAYS_AHEAD * DAY_MS)),
  departureTime: '07:30:00',
  createdAt: '2026-05-01T00:00:00',
  rideType: RideTypeEnum.EGALITARIAN,
  description: 'Saída do centro, com parada no terminal.',
  driver: { name: 'Ana Ofertante', email: 'ana@example.com', phone: '(15) 90000-0000' },
  isOwner: true,
  frequency: RideFrequencyEnum.ONCE,
  repeatUntil: null,
};

const onClose = vi.fn();

const DEFAULT_PROPS: RideFormDialogProps = { open: true, onClose, ride: undefined };

const renderComponent = (props = DEFAULT_PROPS) => render(<RideFormDialog {...props} />);

const destinationField = () =>
  screen.getByRole('textbox', { name: new RegExp(RIDE_FORM_LABELS.destination) });

const departureField = () =>
  screen.getByRole('textbox', { name: new RegExp(RIDE_FORM_LABELS.departure) });

const repeatUntilName = new RegExp(RIDE_FORM_LABELS.repeatUntil);

const repeatUntilField = () => screen.getByRole('textbox', { name: repeatUntilName });

const absentRepeatUntilField = () => screen.queryByRole('textbox', { name: repeatUntilName });

const frequencyLabel = (frequency: RideFrequencyEnum) =>
  RIDE_FREQUENCY_OPTIONS.find((option) => option.value === frequency)?.label ?? '';

async function chooseFrequency(frequency: RideFrequencyEnum) {
  await userEvent.click(
    screen.getByRole('combobox', { name: new RegExp(RIDE_FORM_LABELS.frequency) }),
  );
  await userEvent.click(await screen.findByRole('option', { name: frequencyLabel(frequency) }));
}

async function fillSingleRide() {
  await userEvent.type(destinationField(), 'Terminal Santo Antônio');
  await userEvent.type(departureField(), TYPED_DEPARTURE);
  await userEvent.click(
    screen.getByRole('combobox', { name: new RegExp(RIDE_FORM_LABELS.rideType) }),
  );
  await userEvent.click(await screen.findByRole('option', { name: 'Solidária' }));
}

function holidaysAre(holidays: string[]) {
  server.use(http.get(HOLIDAYS_URL, () => HttpResponse.json(holidays)));
}

function capturePost(): { body: RideInput | null } {
  const captured: { body: RideInput | null } = { body: null };
  server.use(
    http.post(RIDES_URL, async ({ request }) => {
      captured.body = (await request.json()) as RideInput;
      return HttpResponse.json({ id: 'new' }, { status: 201 });
    }),
  );

  return captured;
}

describe('RideFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    holidaysAre([]);
  });

  it('should offer a ride when it gets no ride to edit', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: OFFER_MODE.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: OFFER_MODE.submitLabel })).toBeInTheDocument();
    expect(destinationField()).toHaveValue('');
  });

  it('should explain the ride types beside the type field, as the filter does', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });

    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(RIDE_FORM_LABELS.rideType) }),
    );

    expect(await screen.findByRole('tooltip')).toHaveTextContent(RIDE_TYPE_HELP);
  });

  it('should edit the ride it gets, already filled in', async () => {
    renderComponent({ ...DEFAULT_PROPS, ride: RIDE });

    expect(await screen.findByRole('heading', { name: EDIT_MODE.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: EDIT_MODE.submitLabel })).toBeInTheDocument();
    expect(destinationField()).toHaveValue(RIDE.destination);
    expect(departureField()).toHaveValue(`${toDisplayDate(RIDE.departureDate)} 07:30`);
    expect(
      screen.getByRole('textbox', { name: new RegExp(RIDE_FORM_LABELS.description) }),
    ).toHaveValue(RIDE.description);
  });

  it('should hold each text field to its limit and count the stored description', async () => {
    renderComponent({ ...DEFAULT_PROPS, ride: RIDE });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    expect(destinationField()).toHaveAttribute('maxlength', '100');
    expect(
      screen.getByRole('textbox', { name: new RegExp(RIDE_FORM_LABELS.description) }),
    ).toHaveAttribute('maxlength', '300');
    expect(screen.getByText('40/300', { ignore: '[role="status"]' })).toBeInTheDocument();
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
      destination: RIDE.destination,
      departureDate: RIDE.departureDate,
      departureTime: '07:30',
      rideType: RIDE.rideType,
      frequency: RideFrequencyEnum.ONCE,
      description: RIDE.description,
    });
  });

  it('should keep the dialog open when the api fails, with what was typed', async () => {
    server.use(http.put(`${RIDES_URL}/:id`, () => new HttpResponse(null, { status: 500 })));
    renderComponent({ ...DEFAULT_PROPS, ride: RIDE });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    expect(await screen.findByText(EDIT_MODE.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(destinationField()).toHaveValue(RIDE.destination);
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
    await userEvent.type(departureField(), TYPED_DEPARTURE);
    await userEvent.click(
      screen.getByRole('combobox', { name: new RegExp(RIDE_FORM_LABELS.rideType) }),
    );
    await userEvent.click(await screen.findByRole('option', { name: 'Solidária' }));

    await userEvent.click(screen.getByRole('button', { name: OFFER_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      destination: 'Terminal Santo Antônio',
      departureDate: toApiDate(OFFERED_AT),
      departureTime: OFFERED_HOUR,
      rideType: RideTypeEnum.SOLIDARITY,
      frequency: RideFrequencyEnum.ONCE,
      description: '',
    });
  });

  it('should open on a single ride, without the end date on screen', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });

    expect(
      screen.getByRole('combobox', { name: new RegExp(RIDE_FORM_LABELS.frequency) }),
    ).toHaveTextContent(frequencyLabel(RideFrequencyEnum.ONCE));
    expect(absentRepeatUntilField()).not.toBeInTheDocument();
  });

  it('should show the end date for a recurrence and drop it when back to a single ride', async () => {
    holidaysAre([]);
    const captured = capturePost();
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    await fillSingleRide();

    await chooseFrequency(RideFrequencyEnum.WEEKLY);
    await userEvent.type(repeatUntilField(), format(addDays(OFFERED_AT, 7), 'ddMMyyyy'));
    await chooseFrequency(RideFrequencyEnum.ONCE);
    await userEvent.click(screen.getByRole('button', { name: OFFER_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(absentRepeatUntilField()).not.toBeInTheDocument();
    expect(captured.body).not.toHaveProperty('repeatUntil');
    expect(captured.body?.frequency).toBe(RideFrequencyEnum.ONCE);
  });

  it('should forget the end date once the recurrence goes back to a single ride', async () => {
    holidaysAre([]);
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    await chooseFrequency(RideFrequencyEnum.WEEKLY);
    await userEvent.type(repeatUntilField(), format(addDays(OFFERED_AT, 7), 'ddMMyyyy'));

    await chooseFrequency(RideFrequencyEnum.ONCE);
    await chooseFrequency(RideFrequencyEnum.MONTHLY);

    expect(repeatUntilField()).toHaveValue('');
  });

  it('should offer a weekly ride with its end date', async () => {
    holidaysAre([]);
    const captured = capturePost();
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    await fillSingleRide();

    await chooseFrequency(RideFrequencyEnum.WEEKLY);
    await userEvent.type(repeatUntilField(), format(addDays(OFFERED_AT, 7), 'ddMMyyyy'));
    await userEvent.click(screen.getByRole('button', { name: OFFER_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(captured.body).toEqual({
      destination: 'Terminal Santo Antônio',
      departureDate: toApiDate(OFFERED_AT),
      departureTime: OFFERED_HOUR,
      rideType: RideTypeEnum.SOLIDARITY,
      frequency: RideFrequencyEnum.WEEKLY,
      repeatUntil: toApiDate(addDays(OFFERED_AT, 7)),
      description: '',
    });
  });

  it('should not let the calendar pick a holiday, even for a single ride', async () => {
    holidaysAre([toApiDate(OFFERED_AT)]);
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    await userEvent.type(departureField(), TYPED_DEPARTURE);

    await userEvent.click(screen.getByRole('button', { name: DATE_TIME_PICKER_LABEL }));

    const calendar = within(await screen.findByRole('grid'));
    await waitFor(() =>
      expect(calendar.getByRole('gridcell', { name: String(OFFERED_AT.getDate()) })).toBeDisabled(),
    );
  });

  it('should refuse a typed holiday as the departure of a single ride', async () => {
    holidaysAre([toApiDate(OFFERED_AT)]);
    const captured = capturePost();
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    await fillSingleRide();

    await userEvent.click(screen.getByRole('button', { name: OFFER_MODE.submitLabel }));

    expect(await screen.findByText(RIDE_FORM_MESSAGES.departureOnHoliday)).toBeInTheDocument();
    expect(captured.body).toBeNull();
  });

  it('should name the departure as the start of the recurrence while the ride repeats', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    const startName = new RegExp(RIDE_FORM_LABELS.recurrenceStart);

    await chooseFrequency(RideFrequencyEnum.WEEKLY);
    expect(screen.getByRole('textbox', { name: startName })).toBeInTheDocument();

    await chooseFrequency(RideFrequencyEnum.ONCE);
    expect(screen.queryByRole('textbox', { name: startName })).not.toBeInTheDocument();
    expect(departureField()).toBeInTheDocument();
  });

  it('should refuse a typed holiday as the first departure of a recurrence', async () => {
    holidaysAre([toApiDate(OFFERED_AT)]);
    const captured = capturePost();
    renderComponent();
    await screen.findByRole('heading', { name: OFFER_MODE.title });
    await fillSingleRide();

    await chooseFrequency(RideFrequencyEnum.WEEKLY);
    await userEvent.type(repeatUntilField(), format(addDays(OFFERED_AT, 7), 'ddMMyyyy'));
    await waitFor(() =>
      expect(repeatUntilField()).toHaveValue(format(addDays(OFFERED_AT, 7), 'dd/MM/yyyy')),
    );
    await userEvent.click(screen.getByRole('button', { name: OFFER_MODE.submitLabel }));

    expect(await screen.findByText(RIDE_FORM_MESSAGES.departureOnHoliday)).toBeInTheDocument();
    expect(captured.body).toBeNull();
  });

  it('should send back the next departure it got when a monthly ride is edited', async () => {
    holidaysAre([]);
    let body: RideInput | null = null;
    server.use(
      http.put(`${RIDES_URL}/:id`, async ({ request }) => {
        body = (await request.json()) as RideInput;
        return HttpResponse.json({ id: RIDE.id });
      }),
    );
    const monthly: Ride = {
      ...RIDE,
      frequency: RideFrequencyEnum.MONTHLY,
      repeatUntil: toApiDate(addDays(OFFERED_AT, 60)),
    };
    renderComponent({ ...DEFAULT_PROPS, ride: monthly });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      destination: monthly.destination,
      departureDate: monthly.departureDate,
      departureTime: '07:30',
      rideType: monthly.rideType,
      frequency: RideFrequencyEnum.MONTHLY,
      repeatUntil: monthly.repeatUntil,
      description: monthly.description,
    });
  });
});
