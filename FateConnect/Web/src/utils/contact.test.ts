import { hasContact } from './contact';

describe('hasContact', () => {
  it('should count as contact only the phone and the email together', () => {
    expect(hasContact({ phone: '15990000001', contactEmail: 'ana@example.com' })).toBe(true);
    expect(hasContact({ phone: '15990000001', contactEmail: null })).toBe(false);
    expect(hasContact({ phone: null, contactEmail: 'ana@example.com' })).toBe(false);
    expect(hasContact({ phone: null, contactEmail: null })).toBe(false);
  });
});
