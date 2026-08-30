import { render, screen } from '@app/test/testing-library';

import { CardsList, type CardsListProps } from '.';

const EMPTY_MESSAGE = 'Nenhum item por aqui.';
const CARD_TEXT = 'Cartão semeado';
const PAGINATION_LABEL = 'paginação';

const DEFAULT_PROPS: CardsListProps = {
  isLoading: false,
  isEmpty: false,
  emptyMessage: EMPTY_MESSAGE,
  pagination: <nav aria-label={PAGINATION_LABEL} />,
  children: <article>{CARD_TEXT}</article>,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<CardsList {...props} />);

describe('CardsList', () => {
  it('should show the cards and the pagination once the list answered', () => {
    renderComponent();

    expect(screen.getByText(CARD_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: PAGINATION_LABEL })).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_MESSAGE)).not.toBeInTheDocument();
  });

  it('should hold the place of the cards while loading, without the pagination', () => {
    renderComponent({ ...DEFAULT_PROPS, isLoading: true });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(CARD_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should tell the user when nothing matched, keeping the cards out', () => {
    renderComponent({ ...DEFAULT_PROPS, isEmpty: true });

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(CARD_TEXT)).not.toBeInTheDocument();
  });

  it('should render without a pagination slot', () => {
    renderComponent({ ...DEFAULT_PROPS, pagination: undefined });

    expect(screen.getByText(CARD_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
