import Typography from '@mui/material/Typography';

import { render, screen, userEvent } from '@app/test/testing-library';

import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { themeModeStorage } from './storage/themeModeStorage';

const SWITCH_TO_DARK = 'Ativar tema escuro';
const SWITCH_TO_LIGHT = 'Ativar tema claro';

describe('ThemeProvider', () => {
  it('should provide the theme to components in the tree', () => {
    render(<Typography variant="logo">FateConnect</Typography>);

    const element = screen.getByText('FateConnect');

    expect(element).toBeInTheDocument();
    expect(getComputedStyle(element).fontSize).toBe('1.3rem');
  });

  it('should open in the mode chosen on the last visit', () => {
    themeModeStorage.save('dark');

    render(<ThemeToggleButton />);

    expect(screen.getByRole('button', { name: SWITCH_TO_LIGHT })).toBeInTheDocument();
  });

  it('should remember the mode the reader switches to', async () => {
    render(<ThemeToggleButton />);

    await userEvent.click(screen.getByRole('button', { name: SWITCH_TO_DARK }));

    expect(themeModeStorage.read()).toBe('dark');
  });
});
