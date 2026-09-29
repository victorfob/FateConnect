import { RideFrequencyEnum } from '@app/services/rides/types';

import { RIDE_LIMITS } from '../constants';
import { isRuledOutDeparture, repeatUntilRange } from './recurrenceDays';

const SATURDAY = new Date(2026, 9, 10);
const MONDAY_HOLIDAY = new Date(2026, 9, 12);
const ORDINARY_TUESDAY = new Date(2026, 9, 13);
const HOLIDAYS: ReadonlySet<string> = new Set(['2026-10-12']);

describe('isRuledOutDeparture', () => {
  it('should rule out only the holidays for a single ride', () => {
    expect(isRuledOutDeparture(SATURDAY, RideFrequencyEnum.ONCE, HOLIDAYS)).toBe(false);
    expect(isRuledOutDeparture(MONDAY_HOLIDAY, RideFrequencyEnum.ONCE, HOLIDAYS)).toBe(true);
  });

  it('should rule out the weekend only for a weekdays ride', () => {
    expect(isRuledOutDeparture(SATURDAY, RideFrequencyEnum.WEEKDAYS, HOLIDAYS)).toBe(true);
    expect(isRuledOutDeparture(SATURDAY, RideFrequencyEnum.WEEKLY, HOLIDAYS)).toBe(false);
  });

  it('should rule out the holidays for every ride that repeats too', () => {
    expect(isRuledOutDeparture(MONDAY_HOLIDAY, RideFrequencyEnum.WEEKLY, HOLIDAYS)).toBe(true);
    expect(isRuledOutDeparture(MONDAY_HOLIDAY, RideFrequencyEnum.MONTHLY, HOLIDAYS)).toBe(true);
    expect(isRuledOutDeparture(ORDINARY_TUESDAY, RideFrequencyEnum.WEEKDAYS, HOLIDAYS)).toBe(false);
  });
});

describe('repeatUntilRange', () => {
  it('should open from the day of the departure up to the cap', () => {
    const range = repeatUntilRange('13/10/2026 07:30');

    expect(range.minDate).toEqual(new Date(2026, 9, 13));
    expect(range.maxDate).toEqual(new Date(2026, 9 + RIDE_LIMITS.maxRecurrenceMonths, 13));
  });

  it('should not limit anything while the departure cannot be read', () => {
    expect(repeatUntilRange('13/10/20')).toEqual({});
  });
});
