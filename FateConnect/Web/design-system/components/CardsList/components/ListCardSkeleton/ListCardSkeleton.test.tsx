import { render, screen } from '@app/test/testing-library';

import { ListCardSkeleton } from '.';

const GHOST_CARD_COUNT = 3;

const renderComponent = (count = GHOST_CARD_COUNT) => render(<ListCardSkeleton count={count} />);

describe('ListCardSkeleton', () => {
  it('should stand in for the list while it loads', () => {
    renderComponent();

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getAllByRole('article')).toHaveLength(GHOST_CARD_COUNT);
  });

  // ⛔ Reservar menos do que a página traz faz o conteúdo crescer depois da
  // primeira pintura e empurra o rodapé para fora da janela — foi o defeito.
  it('should draw one ghost for each card the page is about to show', () => {
    const PAGE_WORTH_OF_CARDS = 10;

    renderComponent(PAGE_WORTH_OF_CARDS);

    expect(screen.getAllByRole('article')).toHaveLength(PAGE_WORTH_OF_CARDS);
  });

  it('should leave nothing for the screen reader to announce', () => {
    renderComponent();

    expect(screen.getByRole('status')).toHaveTextContent('');
  });
});
