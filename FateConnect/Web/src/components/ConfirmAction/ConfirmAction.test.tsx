import { render, screen, userEvent } from '@app/test/testing-library';

import { CONFIRMATION } from './constants';
import { ConfirmAction, type ConfirmActionProps } from '.';

const DEFAULT_PROPS: ConfirmActionProps = {
  label: 'Marcar como devolvido',
  icon: null,
  dialogTitle: 'Marcar como devolvido',
  messagePrefix: 'Tem certeza que deseja marcar o item ',
  subject: 'Garrafa azul',
  confirmLabel: 'Confirmar',
  onConfirm: vi.fn(),
};

const renderComponent = (props = DEFAULT_PROPS) => render(<ConfirmAction {...props} />);

describe('ConfirmAction', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should ask first, naming what the action reaches', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.label }));

    expect(screen.getByRole('dialog', { name: DEFAULT_PROPS.dialogTitle })).toHaveTextContent(
      `${DEFAULT_PROPS.messagePrefix}${DEFAULT_PROPS.subject}${CONFIRMATION.messageSuffix}`,
    );
    expect(DEFAULT_PROPS.onConfirm).not.toHaveBeenCalled();
  });

  it('should act only once confirmed', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.label }));
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.confirmLabel }));

    expect(DEFAULT_PROPS.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when the confirmation is dismissed', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.label }));
    await userEvent.click(screen.getByRole('button', { name: CONFIRMATION.dismissLabel }));

    expect(DEFAULT_PROPS.onConfirm).not.toHaveBeenCalled();
  });

  it('should close the sentence with what the consumer needs to add', async () => {
    renderComponent({ ...DEFAULT_PROPS, messageSuffix: ' como devolvido?' });

    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.label }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Garrafa azul como devolvido?');
  });
});
