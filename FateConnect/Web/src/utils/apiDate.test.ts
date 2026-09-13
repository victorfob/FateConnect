import {
  toApiDate,
  toApiDateRange,
  toApiDateText,
  toDisplayDate,
  toDisplayDateRange,
} from './apiDate';

describe('toApiDate', () => {
  it('should pad the day and the month to two digits', () => {
    expect(toApiDate(new Date(2026, 4, 7))).toBe('2026-05-07');
  });

  it('should keep the local day, without shifting by timezone', () => {
    expect(toApiDate(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(toApiDate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('toApiDateText', () => {
  it('should turn what the field shows into what the API stores', () => {
    expect(toApiDateText('07/05/2026')).toBe('2026-05-07');
  });

  it('should fall back to an empty value for no date and for a half typed one', () => {
    expect(toApiDateText('')).toBe('');
    expect(toApiDateText('07/0')).toBe('');
    expect(toApiDateText('32/05/2026')).toBe('');
  });
});

describe('toDisplayDate', () => {
  it('should read back the date the form stored', () => {
    expect(toDisplayDate('2026-05-07')).toBe('07/05/2026');
  });

  it('should return an empty value for an empty or unreadable one', () => {
    expect(toDisplayDate('')).toBe('');
    expect(toDisplayDate('nope')).toBe('');
  });
});

describe('toApiDateRange', () => {
  it('should split the closed period into the two ends the api takes', () => {
    expect(toApiDateRange('22/05/2026 - 25/05/2026')).toEqual({
      dateFrom: '2026-05-22',
      dateTo: '2026-05-25',
    });
  });

  it('should keep the same day on both ends, which is a period of one day', () => {
    expect(toApiDateRange('22/05/2026 - 22/05/2026')).toEqual({
      dateFrom: '2026-05-22',
      dateTo: '2026-05-22',
    });
  });

  // A API trata uma ponta só como aquele dia inteiro, então o fim pode faltar.
  it('should send only the start while the end is missing or half typed', () => {
    expect(toApiDateRange('22/05/2026')).toEqual({ dateFrom: '2026-05-22', dateTo: '' });
    expect(toApiDateRange('22/05/2026 - 25/0')).toEqual({ dateFrom: '2026-05-22', dateTo: '' });
  });

  /**
   * Mesma leitura que o campo faz do texto que se contradiz: o fim não fecha
   * intervalo nenhum, e sem isso a consulta sairia para a API levar um 400.
   */
  it('should drop an end that comes before the start', () => {
    expect(toApiDateRange('25/05/2026 - 22/05/2026')).toEqual({
      dateFrom: '2026-05-25',
      dateTo: '',
    });
  });

  it('should read no period at all out of an empty field', () => {
    expect(toApiDateRange('')).toEqual({ dateFrom: '', dateTo: '' });
  });
});

describe('toDisplayDateRange', () => {
  it('should write back the period the url stored', () => {
    expect(toDisplayDateRange('2026-05-22', '2026-05-25')).toBe('22/05/2026 - 25/05/2026');
  });

  it('should show a lone end as the single day it filters', () => {
    expect(toDisplayDateRange('2026-05-22')).toBe('22/05/2026');
    expect(toDisplayDateRange('', '2026-05-25')).toBe('25/05/2026');
  });

  it('should leave the field empty when the url carries no period', () => {
    expect(toDisplayDateRange()).toBe('');
    expect(toDisplayDateRange('nope', 'nope')).toBe('');
  });

  it('should survive a round trip through the field text', () => {
    const masked = '01/01/2026 - 31/12/2026';
    const { dateFrom, dateTo } = toApiDateRange(masked);

    expect(toDisplayDateRange(dateFrom, dateTo)).toBe(masked);
  });
});
