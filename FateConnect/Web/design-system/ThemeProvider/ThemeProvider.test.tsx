import Typography from '@mui/material/Typography';

import { render, screen } from '@app/test/testing-library';

describe('ThemeProvider', () => {
  it('should provide the theme to components in the tree', () => {
    render(<Typography variant="logo">FateConnect</Typography>);

    const element = screen.getByText('FateConnect');

    expect(element).toBeInTheDocument();
    expect(getComputedStyle(element).fontSize).toBe('1.3rem');
  });
});
