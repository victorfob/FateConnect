import Typography from '@mui/material/Typography';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@app/test/testing-library';

describe('ThemeProvider', () => {
  it('entrega o tema para os componentes da árvore', () => {
    render(<Typography variant="logo">FateConnect</Typography>);

    const elemento = screen.getByText('FateConnect');

    expect(elemento).toBeInTheDocument();
    expect(getComputedStyle(elemento).fontSize).toBe('1.3rem');
  });
});
