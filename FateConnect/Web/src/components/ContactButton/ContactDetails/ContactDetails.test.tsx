import { render, screen } from '@app/test/testing-library';

import { sendEmailLabel } from './constants';
import { ContactDetails, type ContactDetailsProps } from '.';

const PHONE = '(15) 90000-0000';

const DEFAULT_PROPS: ContactDetailsProps = {
  name: 'Maria Silva',
  initials: 'MS',
  thumbnailUrl: null,
  email: 'maria@example.com',
  phone: PHONE,
  phoneHref: 'https://wa.me/5515900000000?text=Ol%C3%A1',
};

const renderComponent = (props = DEFAULT_PROPS) => render(<ContactDetails {...props} />);

describe('ContactDetails', () => {
  it('should show who is being contacted', () => {
    renderComponent();

    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Maria Silva' })).toHaveTextContent('MS');
  });

  it('should hand the email to the mail app, in the same tab', () => {
    renderComponent();

    const emailLink = screen.getByRole('link', { name: sendEmailLabel('maria@example.com') });

    expect(emailLink).toHaveTextContent('maria@example.com');
    expect(emailLink).toHaveAttribute('href', 'mailto:maria@example.com');
    expect(emailLink).not.toHaveAttribute('target');
  });

  it('should send the phone to the conversation it was given, in another tab', () => {
    renderComponent();

    const phoneLink = screen.getByRole('link', { name: '(15) 90000-0000' });

    expect(phoneLink).toHaveAttribute('href', DEFAULT_PROPS.phoneHref);
    expect(phoneLink).toHaveAttribute('target', '_blank');
    expect(phoneLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should center the name and shrink it instead of the contact channels', () => {
    renderComponent({ ...DEFAULT_PROPS, name: 'Mariana Aparecida de Souza Nogueira' });

    const identity = screen.getByText('Mariana Aparecida de Souza Nogueira').parentElement;
    const channels = screen.getByRole('link', { name: PHONE }).parentElement;

    expect(getComputedStyle(identity as HTMLElement).textAlign).toBe('center');
    expect(getComputedStyle(channels as HTMLElement).flexShrink).toBe('0');
  });
});
