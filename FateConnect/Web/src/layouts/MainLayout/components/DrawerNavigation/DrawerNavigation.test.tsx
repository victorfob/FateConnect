import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { render, screen, userEvent, within } from '@app/test/testing-library';

import * as C from './constants';
import { DrawerNavigation } from '.';

const SECTION_LABELS = [C.SERVICES_LABEL, C.ACCOUNT_LABEL];

function renderNavigation(onNavigate = vi.fn(), initialEntry: RoutePathEnum = RoutePathEnum.MENU) {
  const element = <DrawerNavigation onNavigate={onNavigate} />;
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.MENU, element },
      { path: RoutePathEnum.RIDES, element },
    ],
    { initialEntries: [initialEntry] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

function section(label: string) {
  return within(screen.getByRole('list', { name: label }));
}

function serviceLink(path: RoutePathEnum): HTMLElement {
  const link = section(C.SERVICES_LABEL)
    .getAllByRole('link')
    .find((candidate) => candidate.getAttribute('href') === path);
  if (!link) throw new Error(`Serviços has no entry pointing to ${path}`);

  return link;
}

describe('DrawerNavigation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each(SECTION_LABELS)('should announce %s as a heading naming its own group', (label) => {
    renderNavigation();

    expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: label })).toBeInTheDocument();
  });

  it('should carry every service, in the order of the menu', () => {
    renderNavigation();

    const labels = section(C.SERVICES_LABEL)
      .getAllByRole('link')
      .map((link) => link.textContent);

    expect(labels).toEqual(C.SERVICE_LINKS.map(({ label }) => label));
  });

  it('should carry the account and the preferences entries in their own sections', () => {
    renderNavigation();

    C.ACCOUNT_LINKS.forEach(({ label, path }) => {
      expect(section(C.ACCOUNT_LABEL).getByRole('link', { name: label })).toHaveAttribute(
        'href',
        path,
      );
    });
  });

  it('should mark only the current screen inside its section', () => {
    renderNavigation(vi.fn(), RoutePathEnum.RIDES);

    expect(serviceLink(RoutePathEnum.RIDES)).toHaveAttribute('aria-current', 'page');
    expect(serviceLink(RoutePathEnum.DENUNCIATIONS)).not.toHaveAttribute('aria-current');
  });

  it('should navigate and ask for the drawer to close when an entry is used', async () => {
    const onNavigate = vi.fn();
    const router = renderNavigation(onNavigate);

    await userEvent.click(serviceLink(RoutePathEnum.RIDES));

    expect(router.state.location.pathname).toBe(RoutePathEnum.RIDES);
    expect(onNavigate).toHaveBeenCalledOnce();
  });
});
