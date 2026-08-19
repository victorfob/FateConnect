import { useQuery } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { useNotification } from '@app/hooks/useNotification';
import { server } from '@app/mocks/server';
import { apiClient } from '@app/services/httpClient';
import { render, screen, userEvent } from '@app/test/testing-library';

const PING_URL = 'https://api.fateconnect.test/ping';

function ScreenWithFailingQuery() {
  useQuery({
    queryKey: ['ping'],
    queryFn: () => apiClient.get('/ping'),
    retry: false,
  });

  return <div>conteúdo da tela</div>;
}

function NotifyButtons() {
  const { notifySuccess, notifyWarning } = useNotification();

  return (
    <>
      <button type="button" onClick={() => notifySuccess('deu certo')}>
        sucesso
      </button>
      <button type="button" onClick={() => notifyWarning('atenção')}>
        aviso
      </button>
    </>
  );
}

describe('AppProviders', () => {
  it('should notify the user when a request fails, without breaking the screen', async () => {
    server.use(http.get(PING_URL, () => new HttpResponse(null, { status: 500 })));

    render(<ScreenWithFailingQuery />);

    expect(await screen.findByText('Algo deu errado. Tente novamente.')).toBeInTheDocument();
    expect(screen.getByText('conteúdo da tela')).toBeInTheDocument();
  });

  it('should expose success and warning notifications', async () => {
    render(<NotifyButtons />);

    await userEvent.click(screen.getByRole('button', { name: 'sucesso' }));
    expect(await screen.findByText('deu certo')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'aviso' }));
    expect(await screen.findByText('atenção')).toBeInTheDocument();
  });
});
