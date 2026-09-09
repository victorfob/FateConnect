import { CONTACT_DIALOG, CONTACT_LABEL } from '@app/components/ContactButton/constants';
import {
  DeletionReasonEnum,
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
} from '@app/services/lostAndFound/types';
import type { UserContact } from '@app/services/types';
import { render, screen, userEvent, within } from '@app/test/testing-library';

import { RESTORE_LABEL } from './LostItemStatusAction/constants';
import { LostItemCard } from '.';

const CONTACT: UserContact = {
  name: 'Marina Duarte',
  email: 'marina.duarte@example.com',
  phone: '(15) 99999-0001',
};

const OTHER_CONTACT: UserContact = {
  name: 'Rafael Nunes',
  email: 'rafael.nunes@example.com',
  phone: '(15) 99999-0002',
};

const LOST_ITEM: LostItem = {
  id: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  name: 'Carteira preta',
  lostAndFoundType: LostItemKindEnum.LOST,
  place: 'Biblioteca',
  ocurredOn: '2026-08-11T00:00:00',
  description: 'Carteira de couro preta com documentos e cartões.',
  imageUrl: null,
  contact: CONTACT,
  status: LostItemStatusEnum.OPEN,
  deletionReason: null,
  isOwner: false,
  createdAt: '2026-08-12T00:00:00',
};

const COPY_EMAIL_LABEL = `Copiar ${CONTACT.email}`;

const DELETION_NOTE = {
  manual: 'Excluído manualmente.',
  inactivity: 'Excluído automaticamente por inatividade.',
};

const DELETED_ITEM: LostItem = {
  ...LOST_ITEM,
  isOwner: true,
  status: LostItemStatusEnum.DELETED,
  deletionReason: DeletionReasonEnum.USER,
};

/**
 * A nota mora entre a descrição e a ação, então o que vem depois da descrição diz
 * se ela existe. Procurar as duas frases nomeadas deixaria passar uma nota de
 * reserva escrita com outras palavras, que é justamente o que saiu daqui.
 */
function textAfterTheDescription() {
  return screen
    .getByRole('article')
    .textContent?.split(LOST_ITEM.description ?? '')
    .at(-1);
}

const renderComponent = (item = LOST_ITEM) =>
  render(<LostItemCard item={item} onResolve={vi.fn()} onDelete={vi.fn()} onRestore={vi.fn()} />);

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

    expect(dialog.getByText(CONTACT.name)).toBeInTheDocument();
    expect(dialog.getByRole('button', { name: COPY_EMAIL_LABEL })).toBeInTheDocument();
    expect(dialog.getByRole('link', { name: CONTACT.phone })).toBeInTheDocument();
  });

  it('should take the contact from the item, not from a fixed one', async () => {
    renderComponent({ ...LOST_ITEM, contact: OTHER_CONTACT });

    const dialog = await openContact();

    expect(dialog.getByText(OTHER_CONTACT.name)).toBeInTheDocument();
    expect(dialog.queryByText(CONTACT.name)).not.toBeInTheDocument();
  });

  it('should not offer contact on the item registered by the logged user', () => {
    renderComponent({ ...LOST_ITEM, isOwner: true });

    expect(screen.queryByRole('button', { name: CONTACT_LABEL })).not.toBeInTheDocument();
  });

  it('should keep the contact reachable after the item is resolved', async () => {
    renderComponent({ ...LOST_ITEM, status: LostItemStatusEnum.RESOLVED });

    const dialog = await openContact();

    expect(dialog.getByText(CONTACT.name)).toBeInTheDocument();
  });

  it('should open the conversation already mentioning the item', async () => {
    renderComponent();

    const dialog = await openContact();

    expect(dialog.getByRole('link', { name: CONTACT.phone })).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent(LOST_ITEM.name)),
    );
  });

  it('should copy the email and say so', async () => {
    renderComponent();
    const dialog = await openContact();

    await userEvent.click(dialog.getByRole('button', { name: COPY_EMAIL_LABEL }));

    expect(await screen.findByText(CONTACT_DIALOG.emailCopied)).toBeInTheDocument();
    expect(clipboardWrite).toHaveBeenCalledWith(CONTACT.email);
  });

  it('should report a refused copy instead of claiming success', async () => {
    clipboardWrite.mockRejectedValueOnce(new Error('denied'));
    renderComponent();
    const dialog = await openContact();

    await userEvent.click(dialog.getByRole('button', { name: COPY_EMAIL_LABEL }));

    expect(await screen.findByText(CONTACT_DIALOG.emailCopyFailed)).toBeInTheDocument();
  });

  it('should tell apart the hand that deleted the item from the routine that did', () => {
    renderComponent(DELETED_ITEM);

    expect(textAfterTheDescription()).toBe(`${DELETION_NOTE.manual}${RESTORE_LABEL}`);
  });

  it('should say the routine deleted the item when the reason is inactivity', () => {
    renderComponent({ ...DELETED_ITEM, deletionReason: DeletionReasonEnum.INACTIVITY });

    expect(textAfterTheDescription()).toBe(`${DELETION_NOTE.inactivity}${RESTORE_LABEL}`);
  });

  it('should leave the note out when the item comes deleted without a reason', () => {
    renderComponent({ ...DELETED_ITEM, deletionReason: null });

    expect(textAfterTheDescription()).toBe(RESTORE_LABEL);
  });
});
