import { render, screen, userEvent } from '@app/test/testing-library';

import { Pagination, type PaginationProps } from '.';

const PAGE_COUNT = 10;
const FIRST_PAGE = 1;
const SINGLE_PAGE_COUNT = 1;
const THIRD_PAGE = 3;
const THIRD_PAGE_LABEL = 'Ir para a página 3';
const VISIBLE_PAGES = '12345…10';

const DEFAULT_PROPS: PaginationProps = { count: PAGE_COUNT, page: FIRST_PAGE, onChange: vi.fn() };

const renderComponent = (props = DEFAULT_PROPS) => render(<Pagination {...props} />);

describe('Pagination', () => {
  it('should render the pages up to the gap and keep the last one visible', () => {
    renderComponent();

    expect(screen.getByRole('navigation')).toHaveTextContent(VISIBLE_PAGES);
  });

  it('should hand the chosen page to whoever owns the list', async () => {
    const onChange = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onChange });

    await userEvent.click(screen.getByRole('button', { name: THIRD_PAGE_LABEL }));

    expect(onChange).toHaveBeenCalledWith(THIRD_PAGE);
  });

  it('should render nothing when there is a single page', () => {
    renderComponent({ ...DEFAULT_PROPS, count: SINGLE_PAGE_COUNT });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
