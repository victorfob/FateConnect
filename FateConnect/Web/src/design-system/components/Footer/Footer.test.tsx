import { describe, expect, it } from 'vitest';

import { render, screen } from '@app/test/testing-library';
import { Footer } from '.';

const CONTACT = {
  email: 'contato@exemplo.test',
  phone: '(00) 0000-0000',
  address: 'Rua Exemplo, 1',
};

describe('Footer', () => {
  it('should render the title, the contact details and the copyright lines', () => {
    render(
      <Footer
        anchorId="contato"
        title="Entre em contato"
        contact={CONTACT}
        copyrightLines={['linha um', 'linha dois']}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Entre em contato' })).toBeInTheDocument();
    expect(screen.getByText(CONTACT.email)).toBeInTheDocument();
    expect(screen.getByText(CONTACT.phone)).toBeInTheDocument();
    expect(screen.getByText(CONTACT.address)).toBeInTheDocument();
    expect(screen.getByText('linha um')).toBeInTheDocument();
    expect(screen.getByText('linha dois')).toBeInTheDocument();
  });

  it('should expose the anchor used by the navigation', () => {
    render(<Footer anchorId="contato" title="t" contact={CONTACT} copyrightLines={[]} />);

    expect(document.getElementById('contato')).toBeInTheDocument();
  });
});
