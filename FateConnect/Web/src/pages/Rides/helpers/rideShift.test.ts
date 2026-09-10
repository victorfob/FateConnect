import { RideShiftEnum } from '@app/services/rides/types';

import { isRideShift, parseRideShift, RIDE_SHIFT_OPTIONS, rideShiftSlug } from './rideShift';

describe('parseRideShift', () => {
  it.each([
    ['manha', RideShiftEnum.MORNING],
    ['MANHA', RideShiftEnum.MORNING],
    [' tarde ', RideShiftEnum.AFTERNOON],
    ['noite', RideShiftEnum.NIGHT],
  ])('should read %s as a canonical value', (raw, expected) => {
    expect(parseRideShift(raw)).toBe(expected);
  });

  // A URL escreve o nome sem acento, então o valor da API não é palavra dela.
  it.each([['Morning'], ['madrugada'], [null], [undefined], ['']])(
    'should return null for %s',
    (raw) => {
      expect(parseRideShift(raw)).toBeNull();
    },
  );
});

describe('rideShiftSlug', () => {
  it('should survive a round trip through the words the url writes', () => {
    RIDE_SHIFT_OPTIONS.forEach(({ value }) => {
      expect(parseRideShift(rideShiftSlug(value))).toBe(value);
    });
  });
});

describe('isRideShift', () => {
  it('should accept the values the api serialises and refuse the rest', () => {
    expect(isRideShift(RideShiftEnum.AFTERNOON)).toBe(true);
    expect(isRideShift('')).toBe(false);
    expect(isRideShift('tarde')).toBe(false);
  });
});

describe('RIDE_SHIFT_OPTIONS', () => {
  it('should tell the range of each shift, which the name alone does not', () => {
    expect(RIDE_SHIFT_OPTIONS.map(({ label }) => label)).toEqual([
      'Manhã (04:00 - 11:59)',
      'Tarde (12:00 - 17:59)',
      'Noite (18:00 - 03:59)',
    ]);
  });
});
