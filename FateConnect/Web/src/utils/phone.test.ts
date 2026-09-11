import { internationalPhoneDigits } from './phone';

describe('internationalPhoneDigits', () => {
  it('should drop every separator and prefix the country code', () => {
    expect(internationalPhoneDigits('(15) 98115-5018')).toBe('5515981155018');
  });

  it('should keep a landline with eight digits intact', () => {
    expect(internationalPhoneDigits('(15) 3238-5266')).toBe('551532385266');
  });
});
