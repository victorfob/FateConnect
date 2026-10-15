import { RemovalReasonEnum } from '@app/services/moderation/types';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';

import { REMOVAL_DIALOG } from './constants';
import { REMOVAL_REASON_OPTIONS } from './helpers';
import { PublicationRemoval, type PublicationRemovalProps } from '.';

const SENTENCE = 'A carona para Jardim Toledo sai das listas.';

const CHOSEN_REASON = RemovalReasonEnum.COMMERCIAL;
const CHOSEN_REASON_LABEL = REMOVAL_REASON_OPTIONS.find(
  (option) => option.value === CHOSEN_REASON,
)?.label;

const DEFAULT_PROPS: Omit<PublicationRemovalProps, 'children'> = {
  remove: vi.fn(),
  queryKey: 'rides',
  messages: { succeeded: 'Carona excluída.', failed: 'Erro ao excluir a carona. Tente novamente.' },
};

const renderComponent = (props = DEFAULT_PROPS) =>
  render(<PublicationRemoval {...props}>{SENTENCE}</PublicationRemoval>);

const confirmButton = () => screen.getByRole('button', { name: REMOVAL_DIALOG.confirmLabel });

async function openTheDialog() {
  await userEvent.click(screen.getByRole('button', { name: REMOVAL_DIALOG.trigger }));
  await screen.findByRole('dialog', { name: REMOVAL_DIALOG.title });
}

async function chooseTheReason() {
  await userEvent.click(
    screen.getByRole('combobox', { name: new RegExp(REMOVAL_DIALOG.reasonLabel) }),
  );
  await userEvent.click(await screen.findByRole('option', { name: CHOSEN_REASON_LABEL }));
}

describe('PublicationRemoval', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should ask first, saying what leaves the lists', async () => {
    renderComponent();

    await openTheDialog();

    expect(screen.getByRole('dialog')).toHaveTextContent(SENTENCE);
    expect(DEFAULT_PROPS.remove).not.toHaveBeenCalled();
  });

  it('should require a reason before removing', async () => {
    renderComponent();
    await openTheDialog();

    await userEvent.click(confirmButton());

    expect(await screen.findByText(REMOVAL_DIALOG.reasonRequired)).toBeInTheDocument();
    expect(DEFAULT_PROPS.remove).not.toHaveBeenCalled();
  });

  it('should remove with the chosen reason, confirm and close', async () => {
    (DEFAULT_PROPS.remove as Mock).mockResolvedValueOnce(undefined);
    renderComponent();
    await openTheDialog();

    await chooseTheReason();
    await userEvent.click(confirmButton());

    expect(DEFAULT_PROPS.remove).toHaveBeenCalledWith(CHOSEN_REASON);
    expect(await screen.findByText(DEFAULT_PROPS.messages.succeeded)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should keep the dialog open when the removal fails', async () => {
    (DEFAULT_PROPS.remove as Mock).mockRejectedValueOnce(new Error('falhou'));
    renderComponent();
    await openTheDialog();

    await chooseTheReason();
    await userEvent.click(confirmButton());

    expect(await screen.findByText(DEFAULT_PROPS.messages.failed)).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: REMOVAL_DIALOG.title })).toBeInTheDocument();
  });

  it('should hold the confirmation while the removal runs', async () => {
    let finish: VoidFunction = () => undefined;
    (DEFAULT_PROPS.remove as Mock).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    renderComponent();
    await openTheDialog();

    await chooseTheReason();
    await userEvent.click(confirmButton());

    expect(confirmButton()).toBeDisabled();
    expect(confirmButton()).toContainElement(screen.getByRole('progressbar'));
    finish();
    expect(await screen.findByText(DEFAULT_PROPS.messages.succeeded)).toBeInTheDocument();
  });

  it('should do nothing when dismissed', async () => {
    renderComponent();
    await openTheDialog();

    await userEvent.click(screen.getByRole('button', { name: REMOVAL_DIALOG.dismissLabel }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(DEFAULT_PROPS.remove).not.toHaveBeenCalled();
  });
});
