import { createMemoryRouter, RouterProvider } from 'react-router';

import { BACK_TO_MENU_LABEL } from '@app/components/BackToMenu/constants';
import { THEME_LABEL, THEME_OPTIONS, triggerLabel } from '@app/components/ThemeMenu/constants';
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

const themeTrigger = (optionLabel: string) =>
  screen.getByRole('button', { name: triggerLabel(optionLabel) });

const [AUTOMATIC = '', , DARK = ''] = THEME_OPTIONS.map((option) => option.label);

async function chooseTheme(from: string, to: string) {
  await userEvent.click(themeTrigger(from));
  await userEvent.click(await screen.findByRole('button', { name: to }));
}

describe('Preferences', () => {
  it('should title the screen and offer the way back to the menu', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.PREFERENCES_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: BACK_TO_MENU_LABEL })).toHaveAttribute(
      'href',
      RoutePathEnum.MENU,
    );
  });

  it('should group the theme setting under the system section', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: C.APPEARANCE_SECTION_TITLE })).toBeInTheDocument();
    expect(screen.getByText(THEME_LABEL)).toBeInTheDocument();
    expect(screen.getByText(C.THEME_DESCRIPTION)).toBeInTheDocument();
  });

  it('should start following the device and turn the theme dark when it is chosen', async () => {
    renderComponent();
    const lightBackground = documentBackground();

    await chooseTheme(AUTOMATIC, DARK);

    expect(themeTrigger(DARK)).toBeInTheDocument();
    expect(documentBackground()).not.toBe(lightBackground);
  });

  it('should keep the chosen theme when the screen is mounted again', async () => {
    renderComponent();
    await chooseTheme(AUTOMATIC, DARK);

    cleanup();
    renderComponent();

    expect(themeTrigger(DARK)).toBeInTheDocument();
  });
});
