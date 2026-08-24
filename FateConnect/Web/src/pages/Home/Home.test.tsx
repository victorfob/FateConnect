import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import { LandingSectionEnum, RoutePathEnum } from '@app/routes/paths';
import { render, screen, within } from '@app/test/testing-library';

import { Home } from '.';
import {
  DESCRIPTION_HIGHLIGHTS,
  DESCRIPTION_TITLE,
} from './components/LandingDescription/constants';
import { HOW_IT_WORKS_STEPS, HOW_IT_WORKS_TITLE } from './components/LandingHowItWorks/constants';
import { SERVICE_CARDS, SERVICES_TITLE } from './components/LandingServices/constants';

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

    // Alguns rótulos de destaque repetem o título de um card de serviço.
    const destaques = within(screen.getByRole('list', { name: 'Destaques do FateConnect' }));
    DESCRIPTION_HIGHLIGHTS.forEach(({ label }) => {
      expect(destaques.getByText(label)).toBeInTheDocument();
    });
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
