import { VehicleTypeEnum } from '@app/services/rides/types';

import {
  isVehicleType,
  parseVehicleType,
  VEHICLE_TYPE_OPTIONS,
  vehicleTypeLabel,
  vehicleTypeSlug,
} from './rideVehicle';

describe('parseVehicleType', () => {
  it.each([
    ['Car', VehicleTypeEnum.CAR],
    ['carro', VehicleTypeEnum.CAR],
    ['Motorcycle', VehicleTypeEnum.MOTORCYCLE],
    [' MOTO ', VehicleTypeEnum.MOTORCYCLE],
  ])('should read %s as a canonical value', (raw, expected) => {
    expect(parseVehicleType(raw)).toBe(expected);
  });

  it.each([['bicicleta'], [null], [undefined], ['']])('should return null for %s', (raw) => {
    expect(parseVehicleType(raw)).toBeNull();
  });
});

describe('vehicle wording', () => {
  it('should offer car and motorcycle, labelled in pt-BR, with the words the url uses', () => {
    expect(VEHICLE_TYPE_OPTIONS.map((option) => option.label)).toEqual(['Carro', 'Moto']);
    expect(vehicleTypeLabel(VehicleTypeEnum.MOTORCYCLE)).toBe('Moto');
    expect(vehicleTypeSlug(VehicleTypeEnum.CAR)).toBe('carro');
    expect(vehicleTypeSlug(VehicleTypeEnum.MOTORCYCLE)).toBe('moto');
  });

  it('should narrow only the values the api knows', () => {
    expect(isVehicleType('Motorcycle')).toBe(true);
    expect(isVehicleType('moto')).toBe(false);
  });
});
