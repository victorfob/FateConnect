import type { UserContact } from '@app/services/types';
import { render, screen, userEvent, within } from '@app/test/testing-library';

import { CONTACT_LABEL } from './constants';
import { ContactButton } from '.';

/**
 * Nome de cinco palavras e e-mail longo: é o caso que quebrava a linha. O
 * telefone vem cru, como a API o devolve.
 */
const CONTACT: UserContact = {
  name: 'Mariana Aparecida de Souza Nogueira',
  email: 'mariana.nogueira.souza@example.com',
  phone: '15900000000',
};

const MESSAGE = 'Olá';

const DEFAULT_PROPS = { contact: CONTACT, message: MESSAGE };

const renderComponent = (props = DEFAULT_PROPS) => render(<ContactButton {...props} />);

async function openDialog() {
  await userEvent.click(screen.getByRole('button', { name: CONTACT_LABEL }));

  return within(await screen.findByRole('dialog'));
}

describe('ContactButton', () => {
  it('should show the phone masked while the conversation link keeps the raw digits', async () => {
    renderComponent();

    const dialog = await openDialog();
    const phoneLink = dialog.getByRole('link', { name: '(15) 90000-0000' });

    expect(phoneLink).toHaveAttribute('href', 'https://wa.me/5515900000000?text=Ol%C3%A1');
    // A máscara não pode vazar para o endereço: separador quebra a conversa.
    expect(phoneLink.getAttribute('href')).not.toMatch(/[()\s-]/);
  });

  it('should show a long name in full, without cutting it', async () => {
    renderComponent();

    const dialog = await openDialog();

    expect(dialog.getByText(CONTACT.name)).toBeInTheDocument();
  });

  it('should mask a landline with the dash in its own place', async () => {
    renderComponent({ ...DEFAULT_PROPS, contact: { ...CONTACT, phone: '1523456789' } });

    const dialog = await openDialog();

    expect(dialog.getByRole('link', { name: '(15) 2345-6789' })).toHaveAttribute(
      'href',
      'https://wa.me/551523456789?text=Ol%C3%A1',
    );
  });
});
