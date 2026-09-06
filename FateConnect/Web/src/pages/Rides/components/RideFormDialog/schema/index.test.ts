import { format } from 'date-fns';

import { RideTypeEnum } from '@app/services/rides/types';

import { PRODUCT_TIME_ZONE, RIDE_FORM_MESSAGES, RIDE_LIMITS } from '../constants';
import { rideFormSchema, type RideFormInput } from '.';

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
  seats: '3',
  description: 'Saída do centro.',
};

function firstErrorOf(overrides: Partial<RideFormInput>): string | undefined {
  const result = rideFormSchema.safeParse({ ...VALID, ...overrides });
  if (result.success) return undefined;

  return result.error.issues[0]?.message;
}

describe('rideFormSchema', () => {
  it('should accept a filled form and narrow the ride type', () => {
    const result = rideFormSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    expect(result.data?.rideType).toBe(RideTypeEnum.SOLIDARITY);
  });

  it('should trim the destination and the description', () => {
    const result = rideFormSchema.safeParse({
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
      const result = rideFormSchema.safeParse({ ...VALID, departure: '22/05/2026 10:00' });

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

  it('should hold the seats inside the range the api accepts', () => {
    expect(firstErrorOf({ seats: '' })).toBe(RIDE_FORM_MESSAGES.seatsRequired);
    expect(firstErrorOf({ seats: '0' })).toBe(RIDE_FORM_MESSAGES.seatsRequired);
    expect(firstErrorOf({ seats: String(RIDE_LIMITS.maxSeats + 1) })).toBe(
      RIDE_FORM_MESSAGES.seatsRequired,
    );
    expect(firstErrorOf({ seats: '2.5' })).toBe(RIDE_FORM_MESSAGES.seatsRequired);
  });

  it('should accept an empty description but cap a long one', () => {
    expect(firstErrorOf({ description: '' })).toBeUndefined();
    expect(firstErrorOf({ description: 'a'.repeat(RIDE_LIMITS.maxDescription + 1) })).toBe(
      RIDE_FORM_MESSAGES.descriptionTooLong,
    );
  });
});
