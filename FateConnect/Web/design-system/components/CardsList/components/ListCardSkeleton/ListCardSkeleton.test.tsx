import { render, screen } from '@app/test/testing-library';

import { ListCardSkeleton } from '.';

const GHOST_CARD_COUNT = 3;

const renderComponent = () => render(<ListCardSkeleton />);

describe('ListCardSkeleton', () => {
  it('should stand in for the list while it loads', () => {
    renderComponent();

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getAllByRole('article')).toHaveLength(GHOST_CARD_COUNT);
  });

  it('should leave nothing for the screen reader to announce', () => {
    renderComponent();

    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
