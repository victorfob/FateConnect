import { render, screen, userEvent } from '@app/test/testing-library';

import { PageShell, type PageShellProps } from '.';

const TITLE = 'Caronas';
const BACK_LABEL = 'Voltar';
const RESTING_TAB = 'Buscar';
const ACTION_TAB = 'Cadastrar';
const CONTENT = 'conteúdo da tela';

const DEFAULT_PROPS: PageShellProps = {
  title: TITLE,
  action: <PageShell.Back label={BACK_LABEL} icon={<span />} component="a" />,
  tabs: (
    <>
      <PageShell.Tab label={RESTING_TAB} icon={<span />} selected />
      <PageShell.Tab label={ACTION_TAB} icon={<span />} selected={false} />
    </>
  ),
  children: <p>{CONTENT}</p>,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<PageShell {...props} />);

describe('PageShell', () => {
  it('should render the title as the page heading, above the content', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: TITLE })).toBeInTheDocument();
    expect(screen.getByText(CONTENT)).toBeInTheDocument();
  });

  it('should mark the resting tab as selected and leave the other one alone', () => {
    renderComponent();

    expect(screen.getByRole('tab', { name: RESTING_TAB })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: ACTION_TAB })).toHaveAttribute('aria-selected', 'false');
  });

  it('should call the tab action when it is used', async () => {
    const onClick = vi.fn();
    renderComponent({
      ...DEFAULT_PROPS,
      tabs: <PageShell.Tab label={ACTION_TAB} icon={<span />} selected={false} onClick={onClick} />,
    });

    await userEvent.click(screen.getByRole('tab', { name: ACTION_TAB }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should take the back action to wherever it was pointed', () => {
    renderComponent({
      ...DEFAULT_PROPS,
      action: <PageShell.Back label={BACK_LABEL} icon={<span />} component="a" href="/menu" />,
    });

    expect(screen.getByRole('link', { name: BACK_LABEL })).toHaveAttribute('href', '/menu');
  });

  it('should render without the optional slots', () => {
    renderComponent({ title: TITLE, children: <p>{CONTENT}</p> });

    expect(screen.getByRole('heading', { name: TITLE })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: BACK_LABEL })).not.toBeInTheDocument();
  });
});
