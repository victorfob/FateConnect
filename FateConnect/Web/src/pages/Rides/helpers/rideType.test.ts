import { describe, expect, it } from 'vitest';

import { RideTypeEnum } from '@app/services/rides/types';
import { parseRideType, rideTypeDisplayLabel, rideTypeTone } from './rideType';

describe('parseRideType', () => {
  it.each([
    ['Filantropica', RideTypeEnum.PHILANTHROPIC],
    ['filantropica', RideTypeEnum.PHILANTHROPIC],
    ['Igualitaria', RideTypeEnum.EGALITARIAN],
    ['igualitaria', RideTypeEnum.EGALITARIAN],
  ])('should read %s as a canonical value', (raw, expected) => {
    expect(parseRideType(raw)).toBe(expected);
  });

  it.each([[' inválido '], [null], [undefined], ['']])('should return null for %s', (raw) => {
    expect(parseRideType(raw)).toBeNull();
  });
});

describe('rideTypeDisplayLabel', () => {
  it('should label the known types in pt-BR', () => {
    expect(rideTypeDisplayLabel('Filantropica')).toBe('Solidária');
    expect(rideTypeDisplayLabel('igualitaria')).toBe('Igualitária');
  });

  it('should keep an unknown value, falling back to a dash when it is blank', () => {
    expect(rideTypeDisplayLabel('desconhecido')).toBe('desconhecido');
    expect(rideTypeDisplayLabel('   ')).toBe('—');
  });
});

describe('rideTypeTone', () => {
  it.each([
    ['Filantropica', 'success'],
    ['Igualitaria', 'warning'],
    ['desconhecido', 'neutral'],
  ])('should give %s the expected tone', (value, expected) => {
    expect(rideTypeTone(value)).toBe(expected);
  });
});
