import { render, screen, userEvent, within } from '@app/test/testing-library';

import { THEME_LABEL, THEME_OPTIONS, triggerLabel } from './constants';
import { ThemeMenu, type ThemeMenuProps } from '.';

const DEFAULT_PROPS: ThemeMenuProps = {};

const renderComponent = (props = DEFAULT_PROPS) => render(<ThemeMenu {...props} />);

const [AUTOMATIC = '', LIGHT = ''] = THEME_OPTIONS.map((option) => option.label);

const trigger = (optionLabel: string) =>
  screen.getByRole('button', { name: triggerLabel(optionLabel) });

describe('ThemeMenu', () => {
  it('should name the theme in use and offer the three options, with the one in use marked', async () => {
    renderComponent();

    expect(trigger(AUTOMATIC)).toHaveTextContent(AUTOMATIC);

    await userEvent.click(trigger(AUTOMATIC));
    const panel = await screen.findByRole('dialog', { name: THEME_LABEL });

    expect(within(panel).getByText(THEME_LABEL)).toBeInTheDocument();
    expect(
      THEME_OPTIONS.map(({ label }) =>
        within(panel).getByRole('button', { name: label }).getAttribute('aria-current'),
      ),
    ).toEqual(['true', 'false', 'false']);
  });

  it('should apply the chosen theme and close the menu', async () => {
    renderComponent({ iconOnly: true });

    await userEvent.click(trigger(AUTOMATIC));
    await userEvent.click(await screen.findByRole('button', { name: LIGHT }));

    expect(trigger(LIGHT)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: THEME_LABEL })).not.toBeInTheDocument();
  });

  it('should show only the icon on the top bar, named for the reader', () => {
    renderComponent({ iconOnly: true });

    expect(trigger(AUTOMATIC)).not.toHaveTextContent(AUTOMATIC);
  });
});
