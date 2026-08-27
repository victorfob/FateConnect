import { RideTypeEnum } from '@app/services/rides/types';
import { toApiDate } from '@app/utils/apiDate';

import { RIDE_FORM_MESSAGES, RIDE_LIMITS } from '../constants';
import { rideFormSchema, type RideFormInput } from '.';

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS_AHEAD = 30;
const AN_HOUR_MS = 60 * 60 * 1000;

const VALID: RideFormInput = {
  destination: 'Fatec Sorocaba',
  departureDate: toApiDate(new Date(Date.now() + DAYS_AHEAD * DAY_MS)),
  departureTime: '07:30',
  rideType: RideTypeEnum.PHILANTHROPIC,
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
    expect(result.data?.rideType).toBe(RideTypeEnum.PHILANTHROPIC);
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

  it('should require the departure date and time', () => {
    expect(firstErrorOf({ departureDate: '' })).toBe(RIDE_FORM_MESSAGES.departureDateRequired);
    expect(firstErrorOf({ departureTime: '' })).toBe(RIDE_FORM_MESSAGES.departureTimeRequired);
  });

  it('should refuse a departure that already happened', () => {
    const pastMoment = new Date(Date.now() - AN_HOUR_MS);

    expect(
      firstErrorOf({
        departureDate: toApiDate(pastMoment),
        departureTime: `${String(pastMoment.getHours()).padStart(2, '0')}:00`,
      }),
    ).toBe(RIDE_FORM_MESSAGES.departureInPast);
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
