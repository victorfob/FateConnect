import { act, render, screen, userEvent } from '@app/test/testing-library';
import { forgeFit, forgeOverflow, restoreContentHeight } from '@app/test/utils/contentHeight';

import { ListCardDescription, type ListCardDescriptionProps } from '.';

const DESCRIPTION = 'Saio do portão principal e passo pela avenida antes de pegar a rodovia.';
const LABELS = { expand: 'Expandir descrição', collapse: 'Recolher descrição' };
const DEFAULT_PROPS: ListCardDescriptionProps = { children: DESCRIPTION, toggleLabels: LABELS };

const renderComponent = (props = DEFAULT_PROPS) => render(<ListCardDescription {...props} />);

describe('ListCardDescription', () => {
  afterEach(() => {
    restoreContentHeight();
    vi.unstubAllGlobals();
  });

  it('should offer the expansion when the collapsed text hides part of it, and toggle it', async () => {
    forgeOverflow();
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: LABELS.expand }));

    expect(screen.getByRole('button', { name: LABELS.collapse })).toBeInTheDocument();
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
  });

  it('should leave the expansion out when the text fits in the collapsed lines', () => {
    forgeFit();
    renderComponent();

    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: LABELS.expand })).not.toBeInTheDocument();
  });

  it('should show the text whole and without a button when no labels are given', () => {
    forgeOverflow();
    renderComponent({ children: DESCRIPTION });

    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should measure again when the width changes', () => {
    // Só o que foi observado dispara: sem `observe`, nada mede de novo.
    const onResize: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: ResizeObserverCallback) {}

        observe() {
          onResize.push(this.callback);
        }

        disconnect() {}
      },
    );
    forgeFit();
    renderComponent();
    expect(screen.queryByRole('button', { name: LABELS.expand })).not.toBeInTheDocument();

    forgeOverflow();
    act(() => onResize.forEach((callback) => callback([], {} as unknown as ResizeObserver)));

    expect(screen.getByRole('button', { name: LABELS.expand })).toBeInTheDocument();
  });
});
