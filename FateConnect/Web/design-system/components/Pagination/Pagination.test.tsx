import { cleanup, render, screen, userEvent } from '@app/test/testing-library';

import { Pagination, type PaginationProps } from '.';

const PAGE_COUNT = 10;
const FIRST_PAGE = 1;
const SINGLE_PAGE_COUNT = 1;
const THIRD_PAGE = 3;
const THIRD_PAGE_LABEL = 'Ir para a página 3';
const VISIBLE_PAGES = '123…10';
const LONG_COUNT = 12;
const MIDDLE_PAGE = 6;
/** Sete itens são os que cabem numa fileira na largura de um celular. */
const SLOTS_THAT_FIT = 7;
/** No desktop entram os dois vizinhos da atual, e a fileira tem espaço. */
const DESKTOP_SLOTS = 9;
/** As duas páginas em que a lacuna abre, uma de cada ponta — devem se espelhar. */
const FIRST_GAP_PAGE = 4;
const LAST_GAP_PAGE = 9;
const ELLIPSIS = '…';
const PREVIOUS_LABEL = 'Ir para a página anterior';
const NEXT_LABEL = 'Ir para a próxima página';

const DEFAULT_PROPS: PaginationProps = { count: PAGE_COUNT, page: FIRST_PAGE, onChange: vi.fn() };

const renderComponent = (props = DEFAULT_PROPS) => render(<Pagination {...props} />);

/**
 * O jsdom não avalia media query, e sem stub ele responde sempre o estreito.
 * O desktop só se exercita forjando a resposta que o `useMediaQuery` lê.
 */
function stubDesktopViewport() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('Pagination', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('should render the pages up to the gap and keep the last one visible', () => {
    renderComponent();

    expect(screen.getByRole('navigation')).toHaveTextContent(VISIBLE_PAGES);
  });

  it('should keep every state within a single row of seven slots', () => {
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

  // No estreito a atual fica entre as duas reticências, sem vizinho numérico —
  // quem anda de uma em uma são as setas. No desktop os vizinhos voltam.
  it('should offer the neighbours of the current page on the desktop', () => {
    stubDesktopViewport();

    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: MIDDLE_PAGE });

    expect(screen.getAllByRole('listitem')).toHaveLength(DESKTOP_SLOTS);
    expect(
      screen.getByRole('button', { name: `Ir para a página ${MIDDLE_PAGE + 1}` }),
    ).toBeInTheDocument();
  });

  it('should leave the current page without a numbered neighbour on mobile', () => {
    renderComponent({ ...DEFAULT_PROPS, count: LONG_COUNT, page: MIDDLE_PAGE });

    // O par positivo mora aqui: a mesma consulta acha a ponta, então a negativa
    // consegue falhar em vez de passar sobre uma tela vazia.
    expect(
      screen.getByRole('button', { name: `Ir para a página ${FIRST_PAGE}` }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: `Ir para a página ${MIDDLE_PAGE + 1}` }),
    ).not.toBeInTheDocument();
  });

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
