import { render, screen } from '@app/test/testing-library';

import { UnderlinedLink } from '.';

describe('UnderlinedLink', () => {
  it('should render an anchor that stays in the same tab by default', () => {
    render(<UnderlinedLink href="/pagina">Página</UnderlinedLink>);

    const link = screen.getByRole('link', { name: 'Página' });
    expect(link).toHaveAttribute('href', '/pagina');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('should shield the opener when it opens in a new tab', () => {
    render(
      <UnderlinedLink href="https://exemplo.test" opensInNewTab>
        Documento
      </UnderlinedLink>,
    );

    const link = screen.getByRole('link', { name: 'Documento' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should keep the icon inside the clickable area, next to the text', () => {
    render(
      <UnderlinedLink href="/pagina" icon={<svg data-testid="icone" />}>
        Página
      </UnderlinedLink>,
    );

    const link = screen.getByRole('link', { name: 'Página' });
    expect(link).toContainElement(screen.getByTestId('icone'));
  });

  it('should announce the action instead of the visible text when a label is given', () => {
    render(
      <UnderlinedLink href="tel:+551532385266" accessibleLabel="Ligar para (15) 3238-5266">
        (15) 3238-5266
      </UnderlinedLink>,
    );

    expect(screen.getByRole('link', { name: 'Ligar para (15) 3238-5266' })).toBeInTheDocument();
  });
});
