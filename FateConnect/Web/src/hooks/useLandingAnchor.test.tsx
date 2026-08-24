import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';

import { useLandingAnchor } from './useLandingAnchor';

function SectionButton() {
  const goToSection = useLandingAnchor();

  return (
    <button type="button" onClick={() => goToSection(LandingSectionEnum.SERVICES)}>
      Serviços
    </button>
  );
}

function renderAt(initialPath: string) {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.LANDING, element: <SectionButton /> },
      { path: RoutePathEnum.MENU, element: <SectionButton /> },
    ],
    { initialEntries: [initialPath] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('useLandingAnchor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate to the landing page with the fragment when on another route', async () => {
    const router = renderAt(RoutePathEnum.MENU);

    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.LANDING);
    expect(router.state.location.hash).toBe(`#${LandingSectionEnum.SERVICES}`);
  });

  it('should scroll to the section without navigating when already on the landing page', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const section = document.createElement('section');
    section.id = LandingSectionEnum.SERVICES;
    document.body.appendChild(section);

    const router = renderAt(RoutePathEnum.LANDING);
    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(router.state.location.hash).toBe('');

    section.remove();
  });
});
