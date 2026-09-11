import { createMemoryRouter, RouterProvider } from 'react-router';

import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render, screen, within } from '@app/test/testing-library';

import {
  DESCRIPTION_HIGHLIGHTS,
  DESCRIPTION_TITLE,
  HIGHLIGHT_LIST_LABEL,
} from './components/LandingDescription/constants';
import { HOW_IT_WORKS_STEPS, HOW_IT_WORKS_TITLE } from './components/LandingHowItWorks/constants';
import { SERVICE_CARDS, SERVICES_TITLE } from './components/LandingServices/constants';
import { Home } from '.';

function renderHome() {
  const router = createMemoryRouter([{ path: RoutePathEnum.LANDING, element: <Home /> }], {
    initialEntries: [RoutePathEnum.LANDING],
  });
  render(<RouterProvider router={router} />);
}

describe('Home', () => {
  it('should render the presentation with its highlights', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: DESCRIPTION_TITLE })).toBeInTheDocument();

    // Cada rótulo de destaque repete o título de um card de serviço.
    const highlights = within(screen.getByRole('list', { name: HIGHLIGHT_LIST_LABEL }));
    DESCRIPTION_HIGHLIGHTS.forEach(({ label }) => {
      expect(highlights.getByText(label)).toBeInTheDocument();
    });
  });

  it('should name and order the highlights after the service cards', () => {
    renderHome();

    expect(DESCRIPTION_HIGHLIGHTS).toEqual(
      SERVICE_CARDS.map(({ title, Icon }) => ({ label: title, Icon })),
    );

    const highlights = screen.getByRole('list', { name: HIGHLIGHT_LIST_LABEL });
    const renderedLabels = within(highlights)
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(renderedLabels).toEqual(DESCRIPTION_HIGHLIGHTS.map(({ label }) => label));
  });

  it('should render every service card', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: SERVICES_TITLE })).toBeInTheDocument();
    SERVICE_CARDS.forEach(({ title }) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });

  it('should render the how it works steps in order', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: HOW_IT_WORKS_TITLE })).toBeInTheDocument();
    HOW_IT_WORKS_STEPS.forEach(({ number, title }) => {
      expect(screen.getByText(String(number))).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });
  });

  it('should expose the anchors targeted by the header navigation', () => {
    renderHome();

    [
      LandingSectionEnum.SERVICES,
      LandingSectionEnum.HOW_IT_WORKS,
      LandingSectionEnum.LOGIN,
    ].forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });
  });

  it('should render the login card', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: 'Acesse sua conta' })).toBeInTheDocument();
  });
});
