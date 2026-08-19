import { RouterProvider, createMemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LandingSection, RoutePath } from '@app/routes/paths';
import { render } from '@app/test/testing-library';
import { useHashScroll } from './useHashScroll';

function TelaComHash() {
  useHashScroll();

  return <div>conteúdo</div>;
}

function renderEm(initialPath: string) {
  const router = createMemoryRouter([{ path: RoutePath.LANDING, element: <TelaComHash /> }], {
    initialEntries: [initialPath],
  });
  render(<RouterProvider router={router} />);
}

describe('useHashScroll', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rola até a seção quando a URL entra com fragmento', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const secao = document.createElement('section');
    secao.id = LandingSection.LOGIN;
    document.body.appendChild(secao);

    renderEm(`${RoutePath.LANDING}#${LandingSection.LOGIN}`);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    secao.remove();
  });

  it('não rola quando não há fragmento na URL', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');

    renderEm(RoutePath.LANDING);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
