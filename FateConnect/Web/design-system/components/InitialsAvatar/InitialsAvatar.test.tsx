import { render, screen } from '@app/test/testing-library';

import { InitialsAvatar, type InitialsAvatarProps } from '.';

const DEFAULT_PROPS: InitialsAvatarProps = { initials: 'MS', label: 'Maria Silva' };

const renderComponent = (props = DEFAULT_PROPS) => render(<InitialsAvatar {...props} />);

describe('InitialsAvatar', () => {
  it('should announce the full name and show the initials', () => {
    renderComponent();

    const avatar = screen.getByRole('img', { name: 'Maria Silva' });

    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('MS');
  });

  it('should grow the circle when the avatar is the subject of the screen', () => {
    renderComponent({ ...DEFAULT_PROPS, size: 'large' });

    expect(screen.getByRole('img', { name: 'Maria Silva' })).toHaveStyle({
      width: '48px',
      height: '48px',
    });
  });

  it('should paint the circle with the accent colour of the theme', () => {
    renderComponent();

    // O par de contraste dessa combinação é verificado em `contrast.test.ts`.
    expect(screen.getByRole('img', { name: 'Maria Silva' })).toHaveStyle({
      backgroundColor: 'rgb(207, 46, 46)',
    });
  });

  it('should keep the size out of the markup', () => {
    renderComponent({ ...DEFAULT_PROPS, size: 'large' });

    expect(screen.getByRole('img', { name: 'Maria Silva' })).not.toHaveAttribute('size');
  });
});
