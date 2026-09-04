import { CONTACT_DIALOG, CONTACT_LABEL } from '@app/components/ContactButton/constants';
import { LOST_ITEM_OWNER } from '@app/pages/LostAndFound/helpers/lostItemOwner';
import {
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
} from '@app/services/lostAndFound/types';
import { render, screen, userEvent, within } from '@app/test/testing-library';

import { LostItemCard } from '.';

const LOST_ITEM: LostItem = {
  id: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  name: 'Carteira preta',
  type: LostItemKindEnum.LOST,
  place: 'Biblioteca',
  occurredOn: '2026-08-11T00:00:00',
  description: 'Carteira de couro preta com documentos e cartões.',
  photoUrl: null,
  status: LostItemStatusEnum.OPEN,
  deletionReason: null,
  isMine: false,
  createdAt: '2026-08-12T00:00:00',
};

const COPY_EMAIL_LABEL = `Copiar ${LOST_ITEM_OWNER.email}`;

const renderComponent = (item = LOST_ITEM) =>
  render(<LostItemCard item={item} onResolve={vi.fn()} onCancel={vi.fn()} onReopen={vi.fn()} />);

async function openContact() {
  await userEvent.click(screen.getByRole('button', { name: CONTACT_LABEL }));

  return within(await screen.findByRole('dialog'));
}

describe('LostItemCard', () => {
  // O jsdom não implementa a área de transferência; os casos de cópia observam
  // esta escrita, e a instância nasce a cada caso para a rejeição não vazar.
  let clipboardWrite: Mock;

  beforeEach(() => {
    clipboardWrite = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWrite },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  });

  it('should show the contact of whoever registered an item of someone else', async () => {
    renderComponent();

    const dialog = await openContact();

    expect(dialog.getByText(LOST_ITEM_OWNER.name)).toBeInTheDocument();
    expect(dialog.getByRole('button', { name: COPY_EMAIL_LABEL })).toBeInTheDocument();
    expect(dialog.getByRole('link', { name: LOST_ITEM_OWNER.phone })).toBeInTheDocument();
  });

  it('should not offer contact on the item registered by the logged user', () => {
    renderComponent({ ...LOST_ITEM, isMine: true });

    expect(screen.queryByRole('button', { name: CONTACT_LABEL })).not.toBeInTheDocument();
  });

  it('should keep the contact reachable after the item is resolved', async () => {
    renderComponent({ ...LOST_ITEM, status: LostItemStatusEnum.RESOLVED });

    const dialog = await openContact();

    expect(dialog.getByText(LOST_ITEM_OWNER.name)).toBeInTheDocument();
  });

  it('should open the conversation already mentioning the item', async () => {
    renderComponent();

    const dialog = await openContact();

    expect(dialog.getByRole('link', { name: LOST_ITEM_OWNER.phone })).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent(LOST_ITEM.name)),
    );
  });

  it('should copy the email and say so', async () => {
    renderComponent();
    const dialog = await openContact();

    await userEvent.click(dialog.getByRole('button', { name: COPY_EMAIL_LABEL }));

    expect(await screen.findByText(CONTACT_DIALOG.emailCopied)).toBeInTheDocument();
    expect(clipboardWrite).toHaveBeenCalledWith(LOST_ITEM_OWNER.email);
  });

  it('should report a refused copy instead of claiming success', async () => {
    clipboardWrite.mockRejectedValueOnce(new Error('denied'));
    renderComponent();
    const dialog = await openContact();

    await userEvent.click(dialog.getByRole('button', { name: COPY_EMAIL_LABEL }));

    expect(await screen.findByText(CONTACT_DIALOG.emailCopyFailed)).toBeInTheDocument();
  });
});
