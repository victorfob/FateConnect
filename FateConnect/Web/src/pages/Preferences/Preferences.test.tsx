import { createMemoryRouter, RouterProvider } from 'react-router';

import { RoutePathEnum } from '@app/routes/paths';
import { cleanup, render, screen, userEvent } from '@app/test/testing-library';

import * as C from './constants';
import { Preferences } from '.';

function renderComponent() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.PREFERENCES, element: <Preferences /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.PREFERENCES] },
  );
  render(<RouterProvider router={router} />);
}

function documentBackground() {
  return getComputedStyle(document.body).backgroundColor;
}

function themeSwitch() {
  return screen.getByRole('switch', { name: C.THEME_SWITCH_LABEL });
}

describe('Preferences', () => {
  it('should title the screen and offer the way back to the menu', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.PREFERENCES_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: C.BACK_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });

  it('should group the theme setting under the system section', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.APPEARANCE_SECTION_TITLE })).toBeInTheDocument();
    expect(screen.getByText(C.THEME_LABEL)).toBeInTheDocument();
    expect(screen.getByText(C.THEME_DESCRIPTION)).toBeInTheDocument();
  });

  it('should start unchecked in the light theme and turn the theme dark when switched', async () => {
    renderComponent();
    const lightBackground = documentBackground();

    expect(themeSwitch()).not.toBeChecked();

    await userEvent.click(themeSwitch());

    expect(themeSwitch()).toBeChecked();
    expect(documentBackground()).not.toBe(lightBackground);
  });

  it('should keep the chosen mode when the screen is mounted again', async () => {
    renderComponent();
    await userEvent.click(themeSwitch());

    cleanup();
    renderComponent();

    expect(themeSwitch()).toBeChecked();
  });
});
