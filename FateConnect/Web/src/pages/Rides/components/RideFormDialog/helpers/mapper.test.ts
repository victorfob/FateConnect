import { RideTypeEnum, type Ride } from '@app/services/rides/types';

import { EMPTY_RIDE_FORM, type RideFormValues } from '../schema';
import { toFormValues, toRideInput } from './mapper';

const RIDE: Ride = {
  id: 'b1b0f5b4-7a6f-4f1e-9d3a-2f5c8e4a1d70',
  availableSeats: 4,
  destination: 'Fatec Sorocaba',
  departureDate: '2026-05-22T00:00:00',
  departureTime: '07:30:00',
  createdAt: '2026-05-01T00:00:00',
  rideType: RideTypeEnum.EGALITARIAN,
  description: 'Saída do centro.',
  driver: { name: 'Ana Ofertante', email: 'ana@example.com', phone: '(15) 90000-0000' },
  isOwner: true,
};

describe('toFormValues', () => {
  it('should open empty when there is no ride to edit', () => {
    expect(toFormValues(undefined)).toEqual(EMPTY_RIDE_FORM);
  });

  it('should cut the api date and time down to what the fields accept', () => {
    const values = toFormValues(RIDE);

    expect(values.departureDate).toBe('2026-05-22');
    expect(values.departureTime).toBe('07:30');
    expect(values.seats).toBe('4');
    expect(values.rideType).toBe(RideTypeEnum.EGALITARIAN);
  });

  it('should turn a missing description into an empty field', () => {
    expect(toFormValues({ ...RIDE, description: null }).description).toBe('');
  });
});

describe('toRideInput', () => {
  it('should send the seats as a number and carry every field', () => {
    const values: RideFormValues = {
      destination: 'Fatec Sorocaba',
      departureDate: '2026-05-22',
      departureTime: '07:30',
      rideType: RideTypeEnum.EGALITARIAN,
      seats: '4',
      description: 'Saída do centro.',
    };

    expect(toRideInput(values)).toEqual({
      availableSeats: 4,
      destination: 'Fatec Sorocaba',
      departureDate: '2026-05-22',
      departureTime: '07:30',
      rideType: RideTypeEnum.EGALITARIAN,
      description: 'Saída do centro.',
    });
  });
});
