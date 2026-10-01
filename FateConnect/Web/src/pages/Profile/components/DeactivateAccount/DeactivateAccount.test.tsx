import { render, screen } from '@app/test/testing-library';

import { DEACTIVATE } from './constants';
import { DeactivateAccount } from '.';

const renderComponent = () => render(<DeactivateAccount />);

describe('DeactivateAccount', () => {
  it('should stretch the button across the card at any width', () => {
    renderComponent();

    const row = screen.getByRole('button', { name: DEACTIVATE.label }).parentElement;

    expect(row).toHaveStyle({ flexDirection: 'column', alignItems: 'stretch' });
  });
});
