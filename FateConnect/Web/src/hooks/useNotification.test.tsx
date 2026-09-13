import { render, screen, userEvent, waitForElementToBeRemoved } from '@app/test/testing-library';

import { useNotification } from './useNotification';

const LONGER_MS = 8000;

const UNDO_LABEL = 'Desfazer';

function Screen({ onUndo = () => {} }: Readonly<{ onUndo?: VoidFunction }>) {
  const { notifySuccess, notifyError, notifyWarning } = useNotification();

  return (
    <>
      <button type="button" onClick={() => notifySuccess('deu certo')}>
        sucesso
      </button>
      <button type="button" onClick={() => notifyError('deu errado')}>
        erro
      </button>
      <button type="button" onClick={() => notifyWarning('atenção')}>
        alerta
      </button>
      <button
        type="button"
        onClick={() => notifySuccess('fica mais tempo', { autoHideMs: LONGER_MS })}
      >
        demorado
      </button>
      <button
        type="button"
        onClick={() =>
          notifySuccess('arquivado', { action: { label: UNDO_LABEL, onClick: onUndo } })
        }
      >
        com ação
      </button>
    </>
  );
}

describe('useNotification', () => {
  it.each([
    ['sucesso', 'deu certo'],
    ['erro', 'deu errado'],
    ['alerta', 'atenção'],
  ])('should show the message for the %s notification', async (trigger, message) => {
    render(<Screen />);

    await userEvent.click(screen.getByRole('button', { name: trigger }));

    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it('should keep a notification for as long as the caller asked', async () => {
    render(<Screen />);

    await userEvent.click(screen.getByRole('button', { name: 'demorado' }));

    expect(await screen.findByText('fica mais tempo')).toBeInTheDocument();
  });

  // O produto sempre oferece uma saída no aviso; a biblioteca, por padrão, não.
  it('should let the user dismiss the notification', async () => {
    render(<Screen />);
    await userEvent.click(screen.getByRole('button', { name: 'erro' }));
    const aviso = await screen.findByText('deu errado');

    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    // O aviso sai com animação: some do DOM depois da transição, não no clique.
    await waitForElementToBeRemoved(aviso);
  });

  it('should run the action the caller asked for and dismiss the notification', async () => {
    const onUndo = vi.fn();
    render(<Screen onUndo={onUndo} />);
    await userEvent.click(screen.getByRole('button', { name: 'com ação' }));
    const aviso = await screen.findByText('arquivado');

    await userEvent.click(screen.getByRole('button', { name: UNDO_LABEL }));

    expect(onUndo).toHaveBeenCalledTimes(1);
    await waitForElementToBeRemoved(aviso);
  });

  // O notistack substitui a ação do provider pela da chamada em vez de somar as
  // duas, então uma ação própria custaria a saída do aviso.
  it('should keep the dismiss button on a notification that carries its own action', async () => {
    render(<Screen />);

    await userEvent.click(screen.getByRole('button', { name: 'com ação' }));

    expect(await screen.findByRole('button', { name: UNDO_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });
});
