import { relativeTime } from './relativeTime';

const NOW = new Date(2026, 9, 12, 15, 30);

describe('relativeTime', () => {
  it('should say "agora" for less than a minute, and for a clock slightly ahead', () => {
    expect(relativeTime(new Date(2026, 9, 12, 15, 29, 31), NOW)).toBe('agora');
    expect(relativeTime(new Date(2026, 9, 12, 15, 31), NOW)).toBe('agora');
  });

  it('should count the minutes within the hour, in the singular for one', () => {
    expect(relativeTime(new Date(2026, 9, 12, 15, 29), NOW)).toBe('há 1 minuto');
    expect(relativeTime(new Date(2026, 9, 12, 14, 31), NOW)).toBe('há 59 minutos');
  });

  it('should count the hours within the day, in the singular for one', () => {
    expect(relativeTime(new Date(2026, 9, 12, 14, 30), NOW)).toBe('há 1 hora');
    expect(relativeTime(new Date(2026, 9, 11, 15, 31), NOW)).toBe('há 23 horas');
  });

  it('should say "ontem" past a day, while it is still the day before', () => {
    expect(relativeTime(new Date(2026, 9, 11, 15, 30), NOW)).toBe('ontem');
    expect(relativeTime(new Date(2026, 9, 11, 0, 5), NOW)).toBe('ontem');
  });

  it('should write the date from two days back', () => {
    expect(relativeTime(new Date(2026, 9, 10, 23, 59), NOW)).toBe('10/10/2026');
    expect(relativeTime(new Date(2025, 11, 31, 8, 0), NOW)).toBe('31/12/2025');
  });
});
