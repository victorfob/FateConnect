import {
  RideFrequencyEnum,
  RideTypeEnum,
  VehicleTypeEnum,
  type Ride,
} from '@app/services/rides/types';

import { EMPTY_RIDE_FORM, type RideFormValues } from '../schema';
import { toFormValues, toRideInput } from './mapper';

const RIDE: Ride = {
  id: 'b1b0f5b4-7a6f-4f1e-9d3a-2f5c8e4a1d70',
  destination: 'Fatec Sorocaba',
  departureDate: '2026-05-22T00:00:00',
  departureTime: '07:30:00',
  createdAt: '2026-05-01T00:00:00',
  rideType: RideTypeEnum.EGALITARIAN,
  vehicleType: VehicleTypeEnum.MOTORCYCLE,
  description: 'Saída do centro.',
  driver: {
    name: 'Ana Ofertante',
    email: 'ana@example.com',
    phone: '(15) 90000-0000',
    thumbnailUrl: null,
  },
  isOwner: true,
  frequency: RideFrequencyEnum.ONCE,
  repeatUntil: null,
};

describe('toFormValues', () => {
  it('should open empty when there is no ride to edit', () => {
    expect(toFormValues(undefined)).toEqual(EMPTY_RIDE_FORM);
  });

  it('should join the api date and time into the single field', () => {
    const values = toFormValues(RIDE);

    expect(values.departure).toBe('22/05/2026 07:30');
    expect(values.rideType).toBe(RideTypeEnum.EGALITARIAN);
    expect(values.vehicleType).toBe(VehicleTypeEnum.MOTORCYCLE);
  });

  it('should turn a missing description into an empty field', () => {
    expect(toFormValues({ ...RIDE, description: null }).description).toBe('');
  });
});

describe('toRideInput', () => {
  it('should split the departure back into the two fields the api keeps', () => {
    const values: RideFormValues = {
      destination: 'Fatec Sorocaba',
      departure: new Date(2026, 4, 22, 7, 30),
      rideType: RideTypeEnum.EGALITARIAN,
      vehicleType: VehicleTypeEnum.MOTORCYCLE,
      frequency: RideFrequencyEnum.ONCE,
      repeatUntil: null,
      description: 'Saída do centro.',
    };

    expect(toRideInput(values)).toEqual({
      destination: 'Fatec Sorocaba',
      departureDate: '2026-05-22',
      departureTime: '07:30',
      rideType: RideTypeEnum.EGALITARIAN,
      vehicleType: VehicleTypeEnum.MOTORCYCLE,
      frequency: RideFrequencyEnum.ONCE,
      description: 'Saída do centro.',
    });
  });

  it('should send the end date only when the ride repeats', () => {
    const values: RideFormValues = {
      destination: 'Fatec Sorocaba',
      departure: new Date(2026, 4, 22, 7, 30),
      rideType: RideTypeEnum.EGALITARIAN,
      vehicleType: VehicleTypeEnum.CAR,
      frequency: RideFrequencyEnum.WEEKLY,
      repeatUntil: new Date(2026, 5, 19),
      description: '',
    };

    expect(toRideInput(values).repeatUntil).toBe('2026-06-19');
    expect(
      toRideInput({ ...values, frequency: RideFrequencyEnum.ONCE, repeatUntil: null }),
    ).not.toHaveProperty('repeatUntil');
  });
});

describe('toFormValues with a recurrence', () => {
  it('should bring the recurrence and its end date back into the fields', () => {
    const values = toFormValues({
      ...RIDE,
      frequency: RideFrequencyEnum.MONTHLY,
      repeatUntil: '2026-07-31',
    });

    expect(values.frequency).toBe(RideFrequencyEnum.MONTHLY);
    expect(values.repeatUntil).toBe('31/07/2026');
  });

  it('should leave the end date empty for a single ride', () => {
    expect(toFormValues(RIDE).repeatUntil).toBe('');
  });
});
