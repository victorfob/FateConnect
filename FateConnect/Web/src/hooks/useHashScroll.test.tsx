import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render } from '@app/test/testing-library';

import { useHashScroll } from './useHashScroll';

function ScreenWithHash() {
  useHashScroll();

  return <div>content</div>;
}

function renderAt(initialPath: string) {
  const router = createMemoryRouter(
    [{ path: RoutePathEnum.LANDING, element: <ScreenWithHash /> }],
    { initialEntries: [initialPath] },
  );
  render(<RouterProvider router={router} />);
}

describe('useHashScroll', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should scroll to the section when the URL carries a fragment', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
    const section = document.createElement('section');
    section.id = LandingSectionEnum.LOGIN;
    document.body.appendChild(section);

    renderAt(`${RoutePathEnum.LANDING}#${LandingSectionEnum.LOGIN}`);

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    section.remove();
  });

  it('should not scroll when the URL has no fragment', () => {
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');

    renderAt(RoutePathEnum.LANDING);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
