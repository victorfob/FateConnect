import { mailtoUrl, telUrl } from './contactLinks';

describe('contactLinks', () => {
  it('should build the mail address from the e-mail', () => {
    expect(mailtoUrl('contato@exemplo.test')).toBe('mailto:contato@exemplo.test');
  });

  it('should build the dial address with the country code and no separator', () => {
    expect(telUrl('(15) 3238-5266')).toBe('tel:+551532385266');
  });
});
