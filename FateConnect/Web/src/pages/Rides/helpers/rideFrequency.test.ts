import { RideFrequencyEnum } from '@app/services/rides/types';

import { isRideFrequency, RIDE_FREQUENCY_OPTIONS, rideRecurrenceLabel } from './rideFrequency';

const SUNDAY = '2026-10-11';
const MONDAY = '2026-10-12';
const SATURDAY = '2026-10-17';

describe('rideRecurrenceLabel', () => {
  it('should say nothing for a single ride', () => {
    expect(rideRecurrenceLabel(RideFrequencyEnum.ONCE, MONDAY)).toBeNull();
  });

  it('should name the weekday of a weekly ride, from the next departure', () => {
    expect(rideRecurrenceLabel(RideFrequencyEnum.WEEKLY, MONDAY)).toBe('Segundas');
    expect(rideRecurrenceLabel(RideFrequencyEnum.WEEKLY, SUNDAY)).toBe('Domingos');
    expect(rideRecurrenceLabel(RideFrequencyEnum.WEEKLY, SATURDAY)).toBe('Sábados');
  });

  it('should not promise the day of a monthly ride, which moves in shorter months', () => {
    expect(rideRecurrenceLabel(RideFrequencyEnum.MONTHLY, '2027-02-28')).toBe('Todo mês');
  });

  it('should name the weekdays ride by the days it runs', () => {
    expect(rideRecurrenceLabel(RideFrequencyEnum.WEEKDAYS, MONDAY)).toBe('Dias úteis');
  });
});

describe('isRideFrequency', () => {
  it('should accept the api vocabulary only', () => {
    expect(isRideFrequency(RideFrequencyEnum.WEEKLY)).toBe(true);
    expect(isRideFrequency('Anual')).toBe(false);
  });

  it('should open the field on the single ride', () => {
    expect(RIDE_FREQUENCY_OPTIONS[0]?.value).toBe(RideFrequencyEnum.ONCE);
  });
});
