import { render, screen, userEvent } from '@app/test/testing-library';

import { ContactDetails, type ContactDetailsProps } from '.';

const DEFAULT_PROPS: ContactDetailsProps = {
  name: 'Maria Silva',
  initials: 'MS',
  email: 'maria@example.com',
  phone: '(15) 90000-0000',
  phoneHref: 'https://wa.me/5515900000000?text=Ol%C3%A1',
  onCopyEmail: vi.fn(),
};

const renderComponent = (props = DEFAULT_PROPS) => render(<ContactDetails {...props} />);

describe('ContactDetails', () => {
  it('should show who is being contacted', () => {
    renderComponent();

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Maria Silva' })).toHaveTextContent('MS');
  });

  it('should offer the email as an action that says what it does', () => {
    renderComponent();

    // O texto visível é o e-mail; o nome acessível conta o que o clique faz e
    // contém esse texto, como a diretriz de rótulo no nome exige.
    expect(screen.getByRole('button', { name: 'Copiar maria@example.com' })).toHaveTextContent(
      'maria@example.com',
    );
  });

  it('should hand the email action back to whoever composed it', async () => {
    const onCopyEmail = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onCopyEmail });

    await userEvent.click(screen.getByRole('button', { name: 'Copiar maria@example.com' }));

    expect(onCopyEmail).toHaveBeenCalledOnce();
  });

  it('should send the phone to the conversation it was given, in another tab', () => {
    renderComponent();

    const phoneLink = screen.getByRole('link', { name: '(15) 90000-0000' });

    expect(phoneLink).toHaveAttribute('href', DEFAULT_PROPS.phoneHref);
    expect(phoneLink).toHaveAttribute('target', '_blank');
    expect(phoneLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
