import { RouterProvider, createMemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LandingSection, RoutePath } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';
import { useLandingAnchor } from './useLandingAnchor';

function BotaoDeSecao() {
  const goToSection = useLandingAnchor();

  return (
    <button type="button" onClick={() => goToSection(LandingSection.SERVICES)}>
      Serviços
    </button>
  );
}

function renderEm(initialPath: string) {
  const router = createMemoryRouter(
    [
      { path: RoutePath.LANDING, element: <BotaoDeSecao /> },
      { path: RoutePath.CONTACT, element: <BotaoDeSecao /> },
    ],
    { initialEntries: [initialPath] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('useLandingAnchor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('estando em outra rota, navega para a landing com o fragmento', async () => {
    const router = renderEm(RoutePath.CONTACT);

    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(router.state.location.pathname).toBe(RoutePath.LANDING);
    expect(router.state.location.hash).toBe(`#${LandingSection.SERVICES}`);
  });

  it('já estando na landing, rola até a seção sem navegar', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const secao = document.createElement('section');
    secao.id = LandingSection.SERVICES;
    document.body.appendChild(secao);

    const router = renderEm(RoutePath.LANDING);
    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(router.state.location.hash).toBe('');

    secao.remove();
  });
});
