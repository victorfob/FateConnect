import { render, screen } from '@app/test/testing-library';

import { Footer } from '.';

const CONTACT = {
  email: {
    label: 'contato@exemplo.test',
    href: 'mailto:contato@exemplo.test',
    accessibleLabel: 'Enviar e-mail para contato@exemplo.test',
  },
  phone: {
    label: '(00) 0000-0000',
    href: 'tel:+550000000000',
    accessibleLabel: 'Ligar para (00) 0000-0000',
  },
  address: {
    label: 'Rua Exemplo, 1',
    href: 'https://mapa.test/?query=Rua%20Exemplo',
    accessibleLabel: 'Abrir Rua Exemplo, 1 no mapa',
  },
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
    expect(screen.getByText(CONTACT.email.label)).toBeInTheDocument();
    expect(screen.getByText(CONTACT.phone.label)).toBeInTheDocument();
    expect(screen.getByText(CONTACT.address.label)).toBeInTheDocument();
    expect(screen.getByText('linha um')).toBeInTheDocument();
    expect(screen.getByText('linha dois')).toBeInTheDocument();
  });

  it('should reach the mail app, the dialer and the map from each contact line', () => {
    render(<Footer anchorId="contato" title="t" contact={CONTACT} copyrightLines={[]} />);

    expect(screen.getByRole('link', { name: CONTACT.email.accessibleLabel })).toHaveAttribute(
      'href',
      CONTACT.email.href,
    );
    expect(screen.getByRole('link', { name: CONTACT.phone.accessibleLabel })).toHaveAttribute(
      'href',
      CONTACT.phone.href,
    );

    const address = screen.getByRole('link', { name: CONTACT.address.accessibleLabel });
    expect(address).toHaveAttribute('href', CONTACT.address.href);
    expect(address).toHaveAttribute('target', '_blank');
    expect(address).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should keep the mail and the dialer in the same tab', () => {
    render(<Footer anchorId="contato" title="t" contact={CONTACT} copyrightLines={[]} />);

    expect(screen.getByRole('link', { name: CONTACT.email.accessibleLabel })).not.toHaveAttribute(
      'target',
    );
    expect(screen.getByRole('link', { name: CONTACT.phone.accessibleLabel })).not.toHaveAttribute(
      'target',
    );
  });

  it('should expose the anchor used by the navigation', () => {
    render(<Footer anchorId="contato" title="t" contact={CONTACT} copyrightLines={[]} />);

    expect(document.getElementById('contato')).toBeInTheDocument();
  });
});
