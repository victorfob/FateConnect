import { PRIVACY_URL, TERMS_URL } from '@app/constants/legalDocuments';
import { render, screen } from '@app/test/testing-library';

import { LegalFooterLinks } from '.';

describe('LegalFooterLinks', () => {
  it('should open both documents in a new tab', () => {
    render(<LegalFooterLinks />);

    const terms = screen.getByRole('link', { name: 'Termos de uso' });
    expect(terms).toHaveAttribute('href', TERMS_URL);
    expect(terms).toHaveAttribute('target', '_blank');

    const privacy = screen.getByRole('link', { name: 'Política de privacidade' });
    expect(privacy).toHaveAttribute('href', PRIVACY_URL);
    expect(privacy).toHaveAttribute('target', '_blank');
  });
});
