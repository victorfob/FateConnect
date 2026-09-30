import { addDays, addMonths, format, nextMonday, nextSaturday } from 'date-fns';

import { RideFrequencyEnum, RideTypeEnum } from '@app/services/rides/types';

import { PRODUCT_TIME_ZONE, RIDE_FORM_MESSAGES, RIDE_LIMITS } from '../constants';
import { createRideFormSchema, type RideFormInput } from '.';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_AHEAD = 30;

/** O que o campo guarda, e não o que a API recebe — é o que o schema lê. */
function toFieldDeparture(date: Date): string {
  return format(date, 'dd/MM/yyyy HH:mm');
}

const VALID: RideFormInput = {
  destination: 'Fatec Sorocaba',
  departure: toFieldDeparture(new Date(Date.now() + DAYS_AHEAD * DAY_MS)),
  rideType: RideTypeEnum.SOLIDARITY,
  frequency: RideFrequencyEnum.ONCE,
  repeatUntil: '',
  description: 'Saída do centro.',
};

const schema = createRideFormSchema(new Set());

/** Um mês à frente, na segunda e no sábado seguintes: a regra depende do dia da semana. */
const MONDAY = nextMonday(new Date(Date.now() + DAYS_AHEAD * DAY_MS));
const SATURDAY = nextSaturday(MONDAY);
const DEPARTURE_HOUR = 8;

function departureOn(day: Date): string {
  return format(new Date(day).setHours(DEPARTURE_HOUR, 0), 'dd/MM/yyyy HH:mm');
}

function dayText(day: Date): string {
  return format(day, 'dd/MM/yyyy');
}

/** Primeira falha da carona com recorrência, com o campo apontado junto. */
function recurrenceErrorOf(
  overrides: Partial<RideFormInput>,
  holidays: ReadonlySet<string> = new Set(),
) {
  const result = createRideFormSchema(holidays).safeParse({ ...VALID, ...overrides });
  if (result.success) return undefined;

  const [issue] = result.error.issues;

  return { path: issue?.path.join('.'), message: issue?.message };
}

function firstErrorOf(overrides: Partial<RideFormInput>): string | undefined {
  const result = schema.safeParse({ ...VALID, ...overrides });
  if (result.success) return undefined;

  return result.error.issues[0]?.message;
}

describe('createRideFormSchema', () => {
  it('should accept a filled form and narrow the ride type', () => {
    const result = schema.safeParse(VALID);

    expect(result.success).toBe(true);
    expect(result.data?.rideType).toBe(RideTypeEnum.SOLIDARITY);
  });

  it('should trim the destination and the description', () => {
    const result = schema.safeParse({
      ...VALID,
      destination: '  Fatec Sorocaba  ',
      description: '  Saída do centro.  ',
    });

    expect(result.data?.destination).toBe('Fatec Sorocaba');
    expect(result.data?.description).toBe('Saída do centro.');
  });

  it('should hold the destination to the length the api accepts', () => {
    expect(firstErrorOf({ destination: 'ab' })).toBe(RIDE_FORM_MESSAGES.destinationTooShort);
    expect(firstErrorOf({ destination: 'a'.repeat(RIDE_LIMITS.maxDestination + 1) })).toBe(
      RIDE_FORM_MESSAGES.destinationTooLong,
    );
  });

  it('should require the departure', () => {
    expect(firstErrorOf({ departure: '' })).toBe(RIDE_FORM_MESSAGES.departureRequired);
  });

  it('should refuse a departure that is still half typed', () => {
    expect(firstErrorOf({ departure: '22/0' })).toBe(RIDE_FORM_MESSAGES.departureInvalid);
    expect(firstErrorOf({ departure: '22/05/2026' })).toBe(RIDE_FORM_MESSAGES.departureInvalid);
  });

  it('should refuse a departure whose day or hour does not exist', () => {
    expect(firstErrorOf({ departure: '31/02/2026 10:00' })).toBe(
      RIDE_FORM_MESSAGES.departureInvalid,
    );
    expect(firstErrorOf({ departure: '22/05/2026 25:00' })).toBe(
      RIDE_FORM_MESSAGES.departureInvalid,
    );
  });

  // Relógio fixo porque a partida é lida no fuso do produto: sem isso, a máquina
  // que roda o teste decide de que lado do limite a hora cai. Às 12:00 em UTC são
  // 09:00 em São Paulo, então 08:00 já passou e 10:00 ainda não.
  describe('at a fixed clock', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-22T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should refuse a departure that already happened', () => {
      expect(firstErrorOf({ departure: '22/05/2026 08:00' })).toBe(
        RIDE_FORM_MESSAGES.departureInPast,
      );
    });

    it('should accept a departure still to come on the same day', () => {
      expect(firstErrorOf({ departure: '22/05/2026 10:00' })).toBeUndefined();
    });

    it('should hand the departure over already read, not as the typed text', () => {
      const result = schema.safeParse({ ...VALID, departure: '22/05/2026 10:00' });

      expect(result.data?.departure).toEqual(new Date(2026, 4, 22, 10, 0));
    });

    // A suíte fixa o fuso do processo no do produto, que é onde os dois jeitos de
    // comparar concordam — sem trocá-lo, nada aqui prova que a leitura é do fuso
    // do produto e não do de quem preenche.
    it('should read the departure in the product time zone, not in the reader one', () => {
      process.env.TZ = 'UTC';

      expect(firstErrorOf({ departure: '22/05/2026 10:00' })).toBeUndefined();

      process.env.TZ = PRODUCT_TIME_ZONE;
    });
  });

  it('should require a ride type from the api vocabulary', () => {
    expect(firstErrorOf({ rideType: '' })).toBe(RIDE_FORM_MESSAGES.rideTypeRequired);
    expect(firstErrorOf({ rideType: 'Gratuita' })).toBe(RIDE_FORM_MESSAGES.rideTypeRequired);
  });

  describe('recurrence', () => {
    const weekly = { frequency: RideFrequencyEnum.WEEKLY, departure: departureOn(MONDAY) };

    it('should leave the end date out of a single ride, whatever the field holds', () => {
      const result = schema.safeParse({ ...VALID, repeatUntil: '31/12/2099' });

      expect(result.success).toBe(true);
      expect(result.data?.repeatUntil).toBeNull();
    });

    it('should hand the end date over already read when the ride repeats', () => {
      const result = schema.safeParse({
        ...VALID,
        ...weekly,
        repeatUntil: dayText(addDays(MONDAY, 7)),
      });

      expect(result.data?.frequency).toBe(RideFrequencyEnum.WEEKLY);
      expect(result.data?.repeatUntil).toEqual(addDays(new Date(MONDAY).setHours(0, 0, 0, 0), 7));
    });

    it('should require an end date that can be read', () => {
      expect(recurrenceErrorOf({ ...weekly, repeatUntil: '' })).toEqual({
        path: 'repeatUntil',
        message: RIDE_FORM_MESSAGES.repeatUntilRequired,
      });
      expect(recurrenceErrorOf({ ...weekly, repeatUntil: '31/02/20' })).toEqual({
        path: 'repeatUntil',
        message: RIDE_FORM_MESSAGES.repeatUntilInvalid,
      });
    });

    it('should hold the end date between the departure and the cap', () => {
      expect(recurrenceErrorOf({ ...weekly, repeatUntil: dayText(addDays(MONDAY, -1)) })).toEqual({
        path: 'repeatUntil',
        message: RIDE_FORM_MESSAGES.repeatUntilBeforeDeparture,
      });
      expect(recurrenceErrorOf({ ...weekly, repeatUntil: dayText(MONDAY) })).toBeUndefined();
      expect(
        recurrenceErrorOf({
          ...weekly,
          repeatUntil: dayText(addMonths(MONDAY, RIDE_LIMITS.maxRecurrenceMonths)),
        }),
      ).toBeUndefined();
      expect(
        recurrenceErrorOf({
          ...weekly,
          repeatUntil: dayText(addDays(addMonths(MONDAY, RIDE_LIMITS.maxRecurrenceMonths), 1)),
        }),
      ).toEqual({ path: 'repeatUntil', message: RIDE_FORM_MESSAGES.repeatUntilTooFar });
    });

    it('should start a weekdays ride on a weekday only', () => {
      const onSaturday = {
        departure: departureOn(SATURDAY),
        repeatUntil: dayText(addDays(SATURDAY, 7)),
      };

      expect(recurrenceErrorOf({ ...onSaturday, frequency: RideFrequencyEnum.WEEKDAYS })).toEqual({
        path: 'departure',
        message: RIDE_FORM_MESSAGES.departureOnWeekend,
      });
      expect(
        recurrenceErrorOf({ ...onSaturday, frequency: RideFrequencyEnum.WEEKLY }),
      ).toBeUndefined();
    });

    it('should not let any ride depart on a holiday', () => {
      const holidays = new Set([format(MONDAY, 'yyyy-MM-dd')]);
      const holidayIssue = { path: 'departure', message: RIDE_FORM_MESSAGES.departureOnHoliday };

      expect(
        recurrenceErrorOf({ ...weekly, repeatUntil: dayText(addDays(MONDAY, 7)) }, holidays),
      ).toEqual(holidayIssue);
      expect(recurrenceErrorOf({ departure: departureOn(MONDAY) }, holidays)).toEqual(holidayIssue);
      expect(
        recurrenceErrorOf({ departure: departureOn(addDays(MONDAY, 1)) }, holidays),
      ).toBeUndefined();
    });

    it('should require a recurrence from the api vocabulary', () => {
      expect(recurrenceErrorOf({ frequency: 'Anual' })).toEqual({
        path: 'frequency',
        message: RIDE_FORM_MESSAGES.frequencyRequired,
      });
    });
  });

  it('should accept an empty description but cap a long one', () => {
    expect(firstErrorOf({ description: '' })).toBeUndefined();
    expect(firstErrorOf({ description: 'a'.repeat(RIDE_LIMITS.maxDescription + 1) })).toBe(
      RIDE_FORM_MESSAGES.descriptionTooLong,
    );
  });
});
