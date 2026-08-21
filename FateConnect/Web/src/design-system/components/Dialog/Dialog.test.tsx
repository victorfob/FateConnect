import { describe, expect, it, vi } from 'vitest';

import { render, screen, userEvent } from '@app/test/testing-library';
import { Dialog, type DialogProps } from '.';

const DEFAULT_PROPS: DialogProps = {
  open: true,
  onClose: vi.fn(),
  title: 'Informações de Contato',
  children: <Dialog.Body>Miolo do diálogo</Dialog.Body>,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<Dialog {...props} />);

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

    // Não há botão de fechar: o diálogo sai por tecla ou por clique fora dele.
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should stay out of the page while it is closed', () => {
    renderComponent({ ...DEFAULT_PROPS, open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
