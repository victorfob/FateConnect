import { render, screen, userEvent } from '@app/test/testing-library';

import { NavigationDrawer, type NavigationDrawerProps } from '.';

const HEADER_TEXT = 'Marca do produto';
const NAVIGATION_TEXT = 'Caronas';
const FOOTER_TEXT = 'Encerrar sessão';

const HEADER_AND_LIST = 2;
const HEADER_LIST_AND_FOOTER = 3;

const DEFAULT_PROPS: NavigationDrawerProps = {
  open: true,
  onClose: vi.fn(),
  header: HEADER_TEXT,
  children: NAVIGATION_TEXT,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<NavigationDrawer {...props} />);

function drawerPaper(): HTMLElement {
  const paper = screen.getByText(HEADER_TEXT).closest('.MuiDrawer-paper');
  if (!(paper instanceof HTMLElement)) throw new Error('Drawer paper not rendered');

  return paper;
}

describe('NavigationDrawer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header and the navigation it was given', () => {
    renderComponent();

    expect(screen.getByText(HEADER_TEXT)).toBeInTheDocument();
    expect(screen.getByText(NAVIGATION_TEXT)).toBeInTheDocument();
  });

  it('should render the footer it was given as a zone of its own', () => {
    renderComponent({ ...DEFAULT_PROPS, footer: FOOTER_TEXT });

    expect(screen.getByText(FOOTER_TEXT)).toBeInTheDocument();
    expect(drawerPaper().children).toHaveLength(HEADER_LIST_AND_FOOTER);
  });

  it('should leave the footer zone out when no footer is given', () => {
    renderComponent();

    expect(screen.queryByText(FOOTER_TEXT)).not.toBeInTheDocument();
    expect(drawerPaper().children).toHaveLength(HEADER_AND_LIST);
  });

  it('should close when the user presses escape', async () => {
    const onClose = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onClose });

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should stay out of the page while it is closed', () => {
    renderComponent({ ...DEFAULT_PROPS, open: false });

    expect(screen.queryByText(NAVIGATION_TEXT)).not.toBeInTheDocument();
  });
});
