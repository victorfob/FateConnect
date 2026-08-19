import { describe, expect, it } from 'vitest';

import { App } from '@app/App';
import { render, screen } from '@app/test/testing-library';

describe('App', () => {
  it('renderiza o título da aplicação', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'FateConnect' })).toBeInTheDocument();
  });
});
