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

  it('should render the message inside the body', () => {
    renderComponent({
      ...DEFAULT_PROPS,
      children: (
        <Dialog.Body>
          <Dialog.Message>Deseja continuar?</Dialog.Message>
        </Dialog.Body>
      ),
    });

    expect(screen.getByRole('dialog')).toHaveTextContent('Deseja continuar?');
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

  it('should submit the form from the submit slot, and leave validation to the screen', async () => {
    const onSubmit = vi.fn((event: { preventDefault: VoidFunction }) => event.preventDefault());
    renderComponent({
      ...DEFAULT_PROPS,
      children: (
        <Dialog.Form onSubmit={onSubmit}>
          <Dialog.Body>
            <Dialog.Fields>
              <input aria-label="Nome" required />
              <Dialog.Fields.Wide>
                <input aria-label="Descrição" />
              </Dialog.Fields.Wide>
            </Dialog.Fields>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Submit icon={null} label="Salvar alterações" />
          </Dialog.Footer>
        </Dialog.Form>
      ),
    });

    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('should hold the submit while it is loading', () => {
    renderComponent({
      ...DEFAULT_PROPS,
      children: (
        <Dialog.Form onSubmit={vi.fn()}>
          <Dialog.Body>
            <Dialog.Fields layout="column">
              <input aria-label="Nome" />
            </Dialog.Fields>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Submit icon={null} label="Enviar" loading />
          </Dialog.Footer>
        </Dialog.Form>
      ),
    });

    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });
});
