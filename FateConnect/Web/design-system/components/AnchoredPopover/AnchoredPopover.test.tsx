import { render, screen, userEvent, waitFor } from '@app/test/testing-library';

import { AnchoredPopover, type AnchoredPopoverProps } from '.';

const PANEL_LABEL = 'Notificações';
const PANEL_CONTENT = 'Miolo do painel';

const trigger = document.createElement('button');
document.body.append(trigger);

const DEFAULT_PROPS: AnchoredPopoverProps = {
  anchorEl: trigger,
  open: true,
  onClose: vi.fn(),
  label: PANEL_LABEL,
  children: PANEL_CONTENT,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<AnchoredPopover {...props} />);

function backdropElement(): HTMLElement {
  const backdrop = document.querySelector('.MuiBackdrop-root');
  if (!(backdrop instanceof HTMLElement)) throw new Error('Popover backdrop not rendered');

  return backdrop;
}

describe('AnchoredPopover', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should name the panel by the label it was given and render its content', () => {
    renderComponent();

    expect(screen.getByRole('dialog')).toHaveAccessibleName(PANEL_LABEL);
    expect(screen.getByText(PANEL_CONTENT)).toBeInTheDocument();
  });

  it('should stay out of the page while it is closed', () => {
    renderComponent({ ...DEFAULT_PROPS, open: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close when the user presses escape', async () => {
    const onClose = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onClose });

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should close when the user clicks outside of it', async () => {
    const onClose = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onClose });

    await userEvent.click(backdropElement());

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should return the focus to the trigger after it closes', async () => {
    trigger.focus();
    const { rerender } = renderComponent({ ...DEFAULT_PROPS, open: false });

    rerender(<AnchoredPopover {...DEFAULT_PROPS} open />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    rerender(<AnchoredPopover {...DEFAULT_PROPS} open={false} />);

    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
