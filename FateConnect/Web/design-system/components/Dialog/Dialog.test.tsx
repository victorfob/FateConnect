import { render, screen, userEvent } from '@app/test/testing-library';

import { CLOSE_LABEL } from './constants';
import { Dialog, type DialogProps } from '.';

const DEFAULT_PROPS: DialogProps = {
  open: true,
  onClose: vi.fn(),
  title: 'Informações de Contato',
  children: <Dialog.Body>Miolo do diálogo</Dialog.Body>,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<Dialog {...props} />);

// O botão de fechar só aparece abaixo do breakpoint mobile, por CSS. O jsdom não
// avalia media query, então ele fica com `display: none` e precisa ser buscado
// com `hidden`.
describe('Dialog', () => {
  it('should name itself by the title it was given', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: 'Informações de Contato' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Informações de Contato');
  });

  it('should render whatever the consumer puts in the slots', () => {
    renderComponent({
      ...DEFAULT_PROPS,
      children: (
        <>
          <Dialog.Body>Miolo do diálogo</Dialog.Body>
          <Dialog.Footer>
            <button type="button">Confirmar</button>
          </Dialog.Footer>
        </>
      ),
    });

    expect(screen.getByText('Miolo do diálogo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('should close when the user presses escape', async () => {
    const onClose = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onClose });

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should keep the close button out of the desktop', () => {
    renderComponent();

    expect(screen.queryByRole('button', { name: CLOSE_LABEL })).not.toBeInTheDocument();
  });

  it('should close when the user activates the close button', async () => {
    const onClose = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onClose });

    await userEvent.click(screen.getByRole('button', { name: CLOSE_LABEL, hidden: true }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should stay out of the page while it is closed', () => {
    renderComponent({ ...DEFAULT_PROPS, open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
