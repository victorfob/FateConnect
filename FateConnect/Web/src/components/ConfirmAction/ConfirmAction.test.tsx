import { PersonOffOutlinedIcon } from '@design-system/icons';

import { render, screen, userEvent, within } from '@app/test/testing-library';

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

  it('should paint the trigger red only for a destructive action', () => {
    renderComponent({ ...DEFAULT_PROPS, destructive: true });

    // O vermelho da marca como texto, o mesmo par que o teste de contraste mede.
    expect(screen.getByRole('button', { name: DEFAULT_PROPS.label })).toHaveStyle({
      color: 'rgb(207, 46, 46)',
    });
  });

  it('should keep the neutral trigger by default', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: DEFAULT_PROPS.label })).not.toHaveStyle({
      color: 'rgb(207, 46, 46)',
    });
  });

  it.each([
    [false, 'HelpOutlineOutlinedIcon'],
    [true, 'DangerousOutlinedIcon'],
  ])('should ask with the matching icon when destructive is %s', async (destructive, testId) => {
    renderComponent({ ...DEFAULT_PROPS, destructive });

    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.label }));

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('should ask with the icon the action names, in place of the tone default', async () => {
    renderComponent({ ...DEFAULT_PROPS, destructive: true, dialogIcon: PersonOffOutlinedIcon });

    await userEvent.click(screen.getByRole('button', { name: DEFAULT_PROPS.label }));

    expect(screen.getByTestId('PersonOffOutlinedIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('DangerousOutlinedIcon')).not.toBeInTheDocument();
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

  it('should ask from a link in the text, without the icon, when it is not the main way out', async () => {
    renderComponent({ ...DEFAULT_PROPS, icon: <PersonOffOutlinedIcon />, asLink: true });

    const trigger = screen.getByRole('button', { name: DEFAULT_PROPS.label });
    await userEvent.click(trigger);

    expect(trigger).not.toHaveClass('MuiButton-root');
    expect(within(trigger).queryByTestId('PersonOffOutlinedIcon')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: DEFAULT_PROPS.dialogTitle })).toBeInTheDocument();
  });
});
