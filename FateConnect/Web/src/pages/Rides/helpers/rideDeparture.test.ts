import { RideFrequencyEnum } from '@app/services/rides/types';

import { rideDepartureLabel } from './rideDeparture';

describe('rideDepartureLabel', () => {
  it('should join the day, the month and the time of a ride that departs once', () => {
    expect(rideDepartureLabel('2026-10-05', '02:10:00', RideFrequencyEnum.ONCE)).toBe(
      '05/10 às 02:10',
    );
  });

  it('should call the departure the next one when the ride has a recurrence', () => {
    expect(rideDepartureLabel('2026-10-05', '02:10:00', RideFrequencyEnum.WEEKDAYS)).toBe(
      'Próxima: 05/10 às 02:10',
    );
    expect(rideDepartureLabel('2026-10-05', '02:10:00', RideFrequencyEnum.WEEKLY)).toBe(
      'Próxima: 05/10 às 02:10',
    );
    expect(rideDepartureLabel('2026-10-05', '02:10:00', RideFrequencyEnum.MONTHLY)).toBe(
      'Próxima: 05/10 às 02:10',
    );
  });
});
