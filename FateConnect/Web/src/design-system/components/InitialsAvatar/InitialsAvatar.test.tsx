import { describe, expect, it } from 'vitest';

import { render, screen } from '@app/test/testing-library';
import { InitialsAvatar } from '.';

const DEFAULT_PROPS = { initials: 'MS', label: 'Maria Silva' };

const renderComponent = (props = DEFAULT_PROPS) => render(<InitialsAvatar {...props} />);

describe('InitialsAvatar', () => {
  it('should announce the full name and show the initials', () => {
    renderComponent();

    const avatar = screen.getByRole('img', { name: 'Maria Silva' });

    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('MS');
  });

  it('should paint the circle with the accent colour of the theme', () => {
    renderComponent();

    // O par de contraste dessa combinação é verificado em `contrast.test.ts`.
    expect(screen.getByRole('img', { name: 'Maria Silva' })).toHaveStyle({
      backgroundColor: 'rgb(207, 46, 46)',
    });
  });
});
