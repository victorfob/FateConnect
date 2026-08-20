import { describe, expect, it } from 'vitest';

import { render, screen, userEvent, waitForElementToBeRemoved } from '@app/test/testing-library';
import { useNotification } from './useNotification';

const LONGER_MS = 8000;

function Screen() {
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
      <button type="button" onClick={() => notifySuccess('fica mais tempo', LONGER_MS)}>
        demorado
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

  // A duração padrão serve a quase tudo; quem precisa de outra passa o número.
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
});
