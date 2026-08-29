import { RideTypeEnum } from '@app/services/rides/types';

import { parseRideType, rideTypeDisplayLabel, rideTypeTone } from './rideType';

describe('parseRideType', () => {
  it.each([
    ['Solidarity', RideTypeEnum.SOLIDARITY],
    ['solidarity', RideTypeEnum.SOLIDARITY],
    ['Egalitarian', RideTypeEnum.EGALITARIAN],
    ['egalitarian', RideTypeEnum.EGALITARIAN],
  ])('should read %s as a canonical value', (raw, expected) => {
    expect(parseRideType(raw)).toBe(expected);
  });

  it.each([[' inválido '], [null], [undefined], ['']])('should return null for %s', (raw) => {
    expect(parseRideType(raw)).toBeNull();
  });
});

describe('rideTypeDisplayLabel', () => {
  it('should label the known types in pt-BR', () => {
    expect(rideTypeDisplayLabel('Solidarity')).toBe('Solidária');
    expect(rideTypeDisplayLabel('egalitarian')).toBe('Igualitária');
  });

  it('should keep an unknown value, falling back to a dash when it is blank', () => {
    expect(rideTypeDisplayLabel('desconhecido')).toBe('desconhecido');
    expect(rideTypeDisplayLabel('   ')).toBe('—');
  });
});

describe('rideTypeTone', () => {
  it.each([
    ['Solidarity', 'success'],
    ['Egalitarian', 'warning'],
    ['desconhecido', 'neutral'],
  ])('should give %s the expected tone', (value, expected) => {
    expect(rideTypeTone(value)).toBe(expected);
  });
});
