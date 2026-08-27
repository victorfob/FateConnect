import { render, screen, userEvent } from '@app/test/testing-library';
import { EditIcon } from '@ds-root/icons';

import { IconButton, type IconButtonProps } from '.';

const LABEL = 'Editar a carona';

const DEFAULT_PROPS: IconButtonProps = { label: LABEL, children: <EditIcon /> };

const renderComponent = (props = DEFAULT_PROPS) => render(<IconButton {...props} />);

function tooltipTarget(): HTMLElement {
  const target = screen.getByRole('button').parentElement;
  if (!target) throw new Error('O botão renderizou sem o invólucro do tooltip.');

  return target;
}

describe('IconButton', () => {
  it('should name the button by the label it receives', () => {
    renderComponent();

    expect(screen.getByRole('button')).toHaveAccessibleName(LABEL);
    expect(screen.getAllByLabelText(LABEL)).toHaveLength(1);
  });

  it('should show the label as a tooltip on hover', async () => {
    renderComponent();

    await userEvent.hover(screen.getByRole('button'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(LABEL);
  });

  it('should call onClick when the button is clicked', async () => {
    const onClick = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onClick });

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  // O botão desabilitado não recebe evento de ponteiro; quem o recebe é o invólucro.
  it('should still show the tooltip while the button is disabled', async () => {
    renderComponent({ ...DEFAULT_PROPS, disabled: true });

    await userEvent.hover(tooltipTarget());

    expect(await screen.findByRole('tooltip')).toHaveTextContent(LABEL);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
