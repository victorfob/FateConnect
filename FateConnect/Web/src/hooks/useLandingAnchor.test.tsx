import { RouterProvider, createMemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LandingSection, RoutePath } from '@app/routes/paths';
import { render, screen, userEvent } from '@app/test/testing-library';
import { useLandingAnchor } from './useLandingAnchor';

function SectionButton() {
  const goToSection = useLandingAnchor();

  return (
    <button type="button" onClick={() => goToSection(LandingSection.SERVICES)}>
      Serviços
    </button>
  );
}

function renderAt(initialPath: string) {
  const router = createMemoryRouter(
    [
      { path: RoutePath.LANDING, element: <SectionButton /> },
      { path: RoutePath.CONTACT, element: <SectionButton /> },
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

  it('should navigate to the landing page with the fragment when on another route', async () => {
    const router = renderAt(RoutePath.CONTACT);

    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(router.state.location.pathname).toBe(RoutePath.LANDING);
    expect(router.state.location.hash).toBe(`#${LandingSection.SERVICES}`);
  });

  it('should scroll to the section without navigating when already on the landing page', async () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const section = document.createElement('section');
    section.id = LandingSection.SERVICES;
    document.body.appendChild(section);

    const router = renderAt(RoutePath.LANDING);
    await userEvent.click(screen.getByRole('button', { name: 'Serviços' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(router.state.location.hash).toBe('');

    section.remove();
  });
});
