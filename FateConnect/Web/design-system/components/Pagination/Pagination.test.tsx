import { cleanup, render, screen, userEvent } from '@app/test/testing-library';

import { Pagination, type PaginationProps } from '.';

const PAGE_COUNT = 10;
const FIRST_PAGE = 1;
const SINGLE_PAGE_COUNT = 1;
const THIRD_PAGE = 3;
const THIRD_PAGE_LABEL = 'Ir para a página 3';
const VISIBLE_PAGES = '1234…10';
const LONG_COUNT = 12;
const MIDDLE_PAGE = 6;
/** Oito itens são os que cabem numa fileira na largura de um celular. */
const SLOTS_THAT_FIT = 8;
/** As duas páginas em que a lacuna abre, uma de cada ponta — devem se espelhar. */
const FIRST_GAP_PAGE = 4;
const LAST_GAP_PAGE = 9;
const ELLIPSIS = '…';
const PREVIOUS_LABEL = 'Ir para a página anterior';
const NEXT_LABEL = 'Ir para a próxima página';

const DEFAULT_PROPS: PaginationProps = { count: PAGE_COUNT, page: FIRST_PAGE, onChange: vi.fn() };

const renderComponent = (props = DEFAULT_PROPS) => render(<Pagination {...props} />);

describe('Pagination', () => {
  it('should render the pages up to the gap and keep the last one visible', () => {
    renderComponent();

    expect(screen.getByRole('navigation')).toHaveTextContent(VISIBLE_PAGES);
  });

  it('should keep every state within a single row of eight slots', () => {
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: FIRST_PAGE });
    // A semântica de lista some em silêncio se o `component` cair do estilizado.
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(SLOTS_THAT_FIT);

    cleanup();
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: MIDDLE_PAGE });
    expect(screen.getAllByRole('listitem')).toHaveLength(SLOTS_THAT_FIT);

    cleanup();
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: LONG_COUNT });
    expect(screen.getAllByRole('listitem')).toHaveLength(SLOTS_THAT_FIT);
  });

  it('should never drop the page the person is on', () => {
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: MIDDLE_PAGE });

    expect(screen.getByRole('button', { name: `página ${MIDDLE_PAGE}` })).toBeInTheDocument();
  });

  it('should name the arrows for whoever reads by ear', () => {
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: MIDDLE_PAGE });

    expect(screen.getByRole('button', { name: PREVIOUS_LABEL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: NEXT_LABEL })).toBeInTheDocument();
  });

  it('should hand the chosen page to whoever owns the list', async () => {
    const onChange = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onChange });

    await userEvent.click(screen.getByRole('button', { name: THIRD_PAGE_LABEL }));

    expect(onChange).toHaveBeenCalledWith(THIRD_PAGE);
  });

  it.each([FIRST_GAP_PAGE, LAST_GAP_PAGE])(
    'should keep the page that follows within reach on page %i',
    (page) => {
      renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page });

      expect(
        screen.getByRole('button', { name: `Ir para a página ${page + 1}` }),
      ).toBeInTheDocument();
    },
  );

  it('should open the gap on both ends by the same measure', () => {
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: FIRST_GAP_PAGE });
    const noComeco = screen.getAllByText(ELLIPSIS).length;

    cleanup();
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: LAST_GAP_PAGE });

    expect(screen.getAllByText(ELLIPSIS)).toHaveLength(noComeco);
  });

  it('should walk one page at a time through the arrows', async () => {
    const onChange = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: MIDDLE_PAGE, onChange });

    await userEvent.click(screen.getByRole('button', { name: NEXT_LABEL }));
    await userEvent.click(screen.getByRole('button', { name: PREVIOUS_LABEL }));

    expect(onChange).toHaveBeenNthCalledWith(1, MIDDLE_PAGE + 1);
    expect(onChange).toHaveBeenNthCalledWith(2, MIDDLE_PAGE - 1);
  });

  it('should turn off the arrow that points past the ends', () => {
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: FIRST_PAGE });
    expect(screen.getByRole('button', { name: PREVIOUS_LABEL })).toBeDisabled();

    cleanup();
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: LONG_COUNT });
    expect(screen.getByRole('button', { name: NEXT_LABEL })).toBeDisabled();
  });

  it('should render nothing when there is a single page', () => {
    renderComponent({ ...DEFAULT_PROPS, count: SINGLE_PAGE_COUNT });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
