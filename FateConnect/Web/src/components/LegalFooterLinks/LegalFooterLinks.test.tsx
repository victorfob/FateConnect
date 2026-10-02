import { PRIVACY_URL, TERMS_URL } from '@app/constants/legalDocuments';
import { render, screen } from '@app/test/testing-library';
import { narrowDeclarationsFor } from '@app/test/utils/styleSheetRules';

import { LEGAL_FOOTER_LINKS } from './constants';
import { LegalFooterLinks } from '.';

const TERMS_LABEL = labelFor(TERMS_URL);
const PRIVACY_LABEL = labelFor(PRIVACY_URL);
const GAP_8PX = 'gap:0.5rem';

function labelFor(url: string): string {
  const link = LEGAL_FOOTER_LINKS.find((candidate) => candidate.url === url);
  if (!link) throw new Error(`Sem documento para ${url}.`);

  return link.label;
}

describe('LegalFooterLinks', () => {
  it('should open both documents in a new tab', () => {
    render(<LegalFooterLinks />);

    const terms = screen.getByRole('link', { name: TERMS_LABEL });
    expect(terms).toHaveAttribute('href', TERMS_URL);
    expect(terms).toHaveAttribute('target', '_blank');

    const privacy = screen.getByRole('link', { name: PRIVACY_LABEL });
    expect(privacy).toHaveAttribute('href', PRIVACY_URL);
    expect(privacy).toHaveAttribute('target', '_blank');
  });

  it('should keep both documents side by side below md, closer together', () => {
    render(<LegalFooterLinks />);

    const linksRow = screen.getByRole('link', { name: TERMS_LABEL }).parentElement;
    if (!linksRow) throw new Error('Não renderizou a linha dos documentos.');
    const narrowDeclarations = narrowDeclarationsFor(linksRow);

    expect(linksRow).toContainElement(screen.getByRole('link', { name: PRIVACY_LABEL }));
    expect(getComputedStyle(linksRow).flexDirection).toBe('row');
    expect(narrowDeclarations).toContain(GAP_8PX);
    expect(narrowDeclarations).not.toContain('flex-direction');
  });
});
