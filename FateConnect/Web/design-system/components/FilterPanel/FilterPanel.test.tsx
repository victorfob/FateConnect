import { render, screen, userEvent } from '@app/test/testing-library';

import { FilterPanel, type FilterPanelProps } from '.';

const DEFAULT_PROPS: FilterPanelProps = {
  title: 'Filtros',
  submitLabel: 'Filtrar',
  columns: 3,
  onSubmit: vi.fn(),
  children: <FilterPanel.Field>campo</FilterPanel.Field>,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<FilterPanel {...props} />);

const activeDot = () =>
  screen.getByText(DEFAULT_PROPS.title).closest('.MuiBadge-root')?.querySelector('.MuiBadge-badge');

describe('FilterPanel', () => {
  it('should open with the fields showing and close them when the header is clicked', async () => {
    renderComponent();
    const header = screen.getByRole('button', { name: /Filtros/ });

    expect(header).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('should turn the chevron down only while the panel is open', async () => {
    renderComponent();
    const chevron = screen.getByTestId('ChevronRightIcon').parentElement;

    expect(chevron).toHaveClass('Mui-expanded');

    await userEvent.click(screen.getByRole('button', { name: /Filtros/ }));

    expect(chevron).not.toHaveClass('Mui-expanded');
  });

  it('should mark the title only when there are filters in force', () => {
    renderComponent();

    expect(activeDot()).toHaveClass('MuiBadge-invisible');
  });

  it('should show the dot beside the title when the list is filtered', () => {
    renderComponent({ ...DEFAULT_PROPS, active: true });

    expect(activeDot()).not.toHaveClass('MuiBadge-invisible');
  });

  it('should hand the submit to whoever owns the filters', async () => {
    const onSubmit = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onSubmit });

    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.submitLabel }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
