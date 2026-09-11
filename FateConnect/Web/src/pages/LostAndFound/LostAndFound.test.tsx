import { DATE_PICKER_LABEL, type SelectOption } from '@design-system';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import {
  DeletionReasonEnum,
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
} from '@app/services/lostAndFound/types';
import { screen, userEvent, waitFor, within } from '@app/test/testing-library';
import { pagedListHandler, pagedResponse } from '@app/test/utils/pagedList';
import { renderAtRoute } from '@app/test/utils/renderAtRoute';

import { OWN_ITEM_LABEL } from './components/LostItemCard/constants';
import { LOST_ITEM_ACTION_LABELS } from './components/LostItemCard/LostItemActions/constants';
import { CONFIRMATION } from './components/LostItemCard/LostItemConfirmAction/constants';
import {
  lostItemResolveLabel,
  lostItemResolveSuffix,
  RESOLVE_DIALOG,
  RESOLVE_LABEL,
  RESTORE_LABEL,
} from './components/LostItemCard/LostItemStatusAction/constants';
import {
  FILTER_CLEAR_LABEL,
  FILTER_LABELS,
  FILTER_SUBMIT_LABEL,
  FILTER_TITLE,
  LOST_ITEM_KIND_FILTER_OPTIONS,
  LOST_ITEM_OWNER_FILTER_OPTIONS,
  LostItemOwnerFilterEnum,
} from './components/LostItemFilter/constants';
import { EDIT_MODE, REGISTER_MODE } from './components/LostItemFormDialog/constants';
import * as C from './constants';
import { LostAndFound } from '.';

const LOST_ITEMS_URL = 'https://api.fateconnect.test/lostandfound';

const LOST_ITEM: LostItem = {
  id: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  name: 'Carteira preta',
  lostAndFoundType: LostItemKindEnum.LOST,
  place: 'Biblioteca',
  ocurredOn: '2026-08-11T00:00:00',
  description: 'Carteira de couro preta com documentos e cartões.',
  imageUrl: null,
  contact: { name: 'Marina Duarte', email: 'marina.duarte@example.com', phone: '(15) 99999-0001' },
  status: LostItemStatusEnum.OPEN,
  deletionReason: null,
  isOwner: false,
  createdAt: '2026-08-12T00:00:00',
};

/** O ponto não tem papel de acessibilidade: chega-se a ele pelo gatilho que ele marca. */
async function activeFilterDot() {
  // Modal aberto deixa o resto da página `aria-hidden`: o gatilho só volta a ser
  // alcançável por papel depois que o diálogo sai de cena.
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  return screen
    .getByRole('button', { name: FILTER_TITLE })
    .closest('.MuiBadge-root')
    ?.querySelector('.MuiBadge-badge');
}

/** Os campos moram no diálogo: tocá-los pede abri-lo primeiro. */
async function openFilters() {
  // Modal aberto deixa o resto da página `aria-hidden`: o gatilho só volta a ser
  // alcançável por papel depois que o diálogo sai de cena.
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  await userEvent.click(screen.getByRole('button', { name: FILTER_TITLE }));
  await screen.findByRole('dialog');
}

function listReturning(items: LostItem[], onRequest?: (url: URL) => void) {
  server.use(pagedListHandler(LOST_ITEMS_URL, items, onRequest));
}

const NO_CONTENT = 204;

const STATUS_TAG_LABEL = { open: 'Aberto', resolved: 'Resolvido', deleted: 'Arquivado' };

const STATUS_FILTER_ALL_LABEL = 'Todas';

/** O rótulo sai da opção, não do texto: copy muda e o literal não muda junto. */
const optionLabel = (options: readonly SelectOption[], value: string) =>
  options.find((option) => option.value === value)!.label;

const OWNER_MINE_LABEL = optionLabel(LOST_ITEM_OWNER_FILTER_OPTIONS, LostItemOwnerFilterEnum.MINE);

const DELETION_NOTE = {
  owner: 'Arquivado manualmente.',
  inactivity: 'Arquivado automaticamente por inatividade.',
};

const OWN_OPEN_ITEM: LostItem = { ...LOST_ITEM, isOwner: true };

/**
 * Mural que guarda o que as ações mudaram e respeita o filtro de situação, como
 * a API faz: sem isso o item continuaria à vista depois de sair de Aberto.
 */
function boardTracking(initial: LostItem) {
  let current: LostItem = initial;

  server.use(
    http.get(LOST_ITEMS_URL, ({ request }) => {
      const url = new URL(request.url);
      const wanted = url.searchParams.get('status');
      if (wanted && wanted !== current.status) return HttpResponse.json(pagedResponse([], url));

      return HttpResponse.json(pagedResponse([current], url));
    }),
    http.patch(`${LOST_ITEMS_URL}/:itemId`, async ({ request }) => {
      const status = (await request.formData()).get('Status') as LostItemStatusEnum;
      current = { ...current, status, deletionReason: null };

      return HttpResponse.json(current);
    }),
    http.delete(`${LOST_ITEMS_URL}/:itemId`, () => {
      current = {
        ...current,
        status: LostItemStatusEnum.DELETED,
        deletionReason: DeletionReasonEnum.USER,
      };

      return new HttpResponse(null, { status: NO_CONTENT });
    }),
  );
}

function card() {
  return within(screen.getByRole('article'));
}

async function confirmAction(actionLabel: string, confirmLabel: string) {
  await userEvent.click(screen.getByRole('button', { name: actionLabel }));
  await userEvent.click(
    within(await screen.findByRole('dialog')).getByRole('button', { name: confirmLabel }),
  );
}

async function pickOption(fieldLabel: string, chosenLabel: string) {
  await userEvent.click(screen.getByRole('combobox', { name: new RegExp(fieldLabel) }));
  await userEvent.click(
    within(screen.getByRole('listbox')).getByRole('option', { name: chosenLabel }),
  );
}

const periodField = () => screen.getByRole('textbox', { name: new RegExp(FILTER_LABELS.period) });

async function filterByStatus(chosenLabel: string) {
  await openFilters();
  await pickOption(FILTER_LABELS.status, chosenLabel);
  await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}

function renderComponent(search = '') {
  return renderAtRoute(RoutePathEnum.LOST_AND_FOUND, <LostAndFound />, search);
}

describe('LostAndFound', () => {
  it('should render the title as the page heading and the item on the board', async () => {
    listReturning([LOST_ITEM]);

    renderComponent();

    expect(screen.getByRole('heading', { name: C.LOST_AND_FOUND_TITLE })).toBeInTheDocument();
    expect(await screen.findByText(LOST_ITEM.name)).toBeInTheDocument();
    expect(screen.getByText(LOST_ITEM.place)).toBeInTheDocument();
    expect(screen.getByText(LOST_ITEM.description!)).toBeInTheDocument();
  });

  it('should open the board on the items that are still open', async () => {
    let received: URL | null = null;
    listReturning([LOST_ITEM], (url) => {
      received = url;
    });

    renderComponent();

    await waitFor(() => expect(received).not.toBeNull());
    expect(received!.searchParams.get('status')).toBe(LostItemStatusEnum.OPEN);
  });

  it('should ask the api without a status when every status is wanted', async () => {
    let requestUrl: URL | null = null;
    listReturning([LOST_ITEM], (url) => {
      requestUrl = url;
    });
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await filterByStatus(STATUS_FILTER_ALL_LABEL);

    await waitFor(() => expect(requestUrl!.searchParams.has('status')).toBe(false));
    expect(await screen.findByText(LOST_ITEM.name)).toBeInTheDocument();
  });

  it('should tell the user when no item matches', async () => {
    listReturning([]);

    renderComponent();

    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();
  });

  it('should take the user back to the menu from the action', async () => {
    listReturning([]);

    const router = renderComponent();

    await userEvent.click(screen.getByRole('link', { name: C.BACK_LABEL }));

    expect(router.state.location.pathname).toBe(RoutePathEnum.MENU);
  });

  it('should ask the api again with what the filter asked for', async () => {
    let requestUrl: URL | null = null;
    listReturning([], (url) => {
      requestUrl = url;
    });
    renderComponent();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await openFilters();
    await userEvent.type(screen.getByLabelText(FILTER_LABELS.searchTerm), 'Carteira');
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() => expect(requestUrl!.searchParams.get('searchTerm')).toBe('Carteira'));
    expect(requestUrl!.searchParams.get('status')).toBe(LostItemStatusEnum.OPEN);
    expect(await activeFilterDot()).not.toHaveClass('MuiBadge-invisible');
  });

  it('should build the request from every field the filter offers', async () => {
    let requestUrl: URL | null = null;
    listReturning([], (url) => {
      requestUrl = url;
    });
    renderComponent();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await openFilters();
    await userEvent.type(periodField(), '0108202605082026');
    await pickOption(
      FILTER_LABELS.kind,
      optionLabel(LOST_ITEM_KIND_FILTER_OPTIONS, LostItemKindEnum.LOST),
    );
    await pickOption(FILTER_LABELS.owner, OWNER_MINE_LABEL);
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() =>
      expect(Object.fromEntries(requestUrl!.searchParams)).toMatchObject({
        dateFrom: '2026-08-01',
        dateTo: '2026-08-05',
        lostAndFoundType: LostItemKindEnum.LOST,
        onlyMine: 'true',
      }),
    );
  });

  it('should leave the filter unmarked while only the open items are asked for', async () => {
    listReturning([]);

    renderComponent();

    await screen.findByText(C.EMPTY_LIST_MESSAGE);
    expect(await activeFilterDot()).toHaveClass('MuiBadge-invisible');
  });

  it('should hand the board back to the open items when the filter is cleared', async () => {
    let requestUrl: URL | null = null;
    listReturning([], (url) => {
      requestUrl = url;
    });
    renderComponent();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await openFilters();
    await userEvent.type(screen.getByLabelText(FILTER_LABELS.searchTerm), 'Carteira');
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));
    await waitFor(() => expect(requestUrl!.searchParams.get('searchTerm')).toBe('Carteira'));

    await openFilters();
    await userEvent.click(screen.getByRole('button', { name: FILTER_CLEAR_LABEL }));

    // O mural abre em Aberto, então limpar devolve a situação a ela — e o ponto apaga.
    await waitFor(() => expect(requestUrl!.searchParams.has('searchTerm')).toBe(false));
    expect(requestUrl!.searchParams.get('status')).toBe(LostItemStatusEnum.OPEN);
    expect(await activeFilterDot()).toHaveClass('MuiBadge-invisible');
  });

  it('should mark only the item that belongs to the user', async () => {
    listReturning([{ ...LOST_ITEM, isOwner: true }]);

    renderComponent();

    await screen.findByText(LOST_ITEM.name);
    expect(screen.queryAllByText(OWN_ITEM_LABEL)).not.toHaveLength(0);
  });

  it('should leave someone else item without the owner mark', async () => {
    listReturning([LOST_ITEM]);

    renderComponent();

    await screen.findByText(LOST_ITEM.name);
    expect(screen.queryAllByText(OWN_ITEM_LABEL)).toHaveLength(0);
  });

  it('should not let the filter ask for a day that has not happened yet', async () => {
    // Data fixa para o dia seguinte cair no mesmo mês, em qualquer dia do ano.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 10));
    listReturning([]);
    renderComponent();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await openFilters();
    await userEvent.click(screen.getByRole('button', { name: DATE_PICKER_LABEL }));

    const calendar = within(await screen.findByRole('grid'));
    expect(calendar.getByRole('gridcell', { name: '10' })).toBeEnabled();
    expect(calendar.getByRole('gridcell', { name: '11' })).toBeDisabled();

    vi.useRealTimers();
  });

  it('should tell lost from found by the icon on the card', async () => {
    listReturning([
      LOST_ITEM,
      { ...LOST_ITEM, id: 'outro', lostAndFoundType: LostItemKindEnum.FOUND },
    ]);

    renderComponent();

    await screen.findAllByText(LOST_ITEM.name);
    expect(screen.getByTestId('NoBackpackOutlinedIcon')).toBeInTheDocument();
    expect(screen.getByTestId('BackHandOutlinedIcon')).toBeInTheDocument();
  });

  it('should open on the search tab, with the register dialog closed', () => {
    listReturning([]);

    renderComponent();

    expect(screen.getByRole('tab', { name: C.SEARCH_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: C.REGISTER_TAB_LABEL })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.queryByRole('heading', { name: REGISTER_MODE.title })).not.toBeInTheDocument();
  });

  it('should open the register dialog from the tab, without leaving the route', async () => {
    listReturning([]);
    const router = renderComponent();

    await userEvent.click(screen.getByRole('tab', { name: C.REGISTER_TAB_LABEL }));

    expect(await screen.findByRole('heading', { name: REGISTER_MODE.title })).toBeInTheDocument();
    // O diálogo é modal e esconde a página atrás dele da árvore de
    // acessibilidade: a aba só é alcançável com `hidden`. O destaque dela é
    // visual enquanto o diálogo cobre a tela.
    expect(screen.getByRole('tab', { name: C.REGISTER_TAB_LABEL, hidden: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(router.state.location.pathname).toBe(RoutePathEnum.LOST_AND_FOUND);
  });

  it('should hand the highlight back to the search tab when the dialog is dismissed', async () => {
    listReturning([]);
    renderComponent();

    await userEvent.click(screen.getByRole('tab', { name: C.REGISTER_TAB_LABEL }));
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.getByRole('tab', { name: C.SEARCH_TAB_LABEL })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
  });

  it('should walk the item from open to deleted, back to open and then to concluded', async () => {
    boardTracking(OWN_OPEN_ITEM);
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await userEvent.click(screen.getByRole('button', { name: LOST_ITEM_ACTION_LABELS.delete }));

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.deleteSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();

    await filterByStatus(STATUS_TAG_LABEL.deleted);

    expect(await screen.findByText(LOST_ITEM.name)).toBeInTheDocument();
    expect(card().getAllByText(STATUS_TAG_LABEL.deleted)).toHaveLength(1);
    expect(card().getByText(DELETION_NOTE.owner)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: RESTORE_LABEL }));

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.restoreSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();

    await filterByStatus(STATUS_TAG_LABEL.open);
    await screen.findByText(LOST_ITEM.name);
    await confirmAction(RESOLVE_LABEL[LostItemKindEnum.LOST], RESOLVE_DIALOG.confirmLabel);

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.resolveSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();

    await filterByStatus(STATUS_TAG_LABEL.resolved);

    expect(await screen.findByText(LOST_ITEM.name)).toBeInTheDocument();
    expect(card().getAllByText(STATUS_TAG_LABEL.resolved)).toHaveLength(1);
  });

  it('should archive the item on the click, without asking first', async () => {
    boardTracking(OWN_OPEN_ITEM);
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await userEvent.click(screen.getByRole('button', { name: LOST_ITEM_ACTION_LABELS.delete }));

    // O resolver logo abaixo continua abrindo diálogo, então esta consulta acha
    // alguma coisa nesta tela — a ausência aqui é do porteiro que saiu.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.deleteSucceeded)).toBeInTheDocument();
  });

  it('should offer undo in the notice and put the item back in the open list', async () => {
    boardTracking(OWN_OPEN_ITEM);
    renderComponent();
    await screen.findByText(LOST_ITEM.name);
    await userEvent.click(screen.getByRole('button', { name: LOST_ITEM_ACTION_LABELS.delete }));
    await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.deleteSucceeded);

    await userEvent.click(screen.getByRole('button', { name: C.UNDO_LABEL }));

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.restoreSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(LOST_ITEM.name)).toBeInTheDocument();
    expect(card().getAllByText(STATUS_TAG_LABEL.open)).toHaveLength(1);
  });

  it('should name the found outcome in the dialog of a lost item', async () => {
    listReturning([OWN_OPEN_ITEM]);
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await userEvent.click(
      screen.getByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.LOST] }),
    );

    const dialog = await screen.findByRole('dialog', {
      name: RESOLVE_LABEL[LostItemKindEnum.LOST],
    });

    expect(within(dialog).getByText(LOST_ITEM.name).parentElement).toHaveTextContent(
      `${RESOLVE_DIALOG.messagePrefix}${LOST_ITEM.name}${lostItemResolveSuffix(LostItemKindEnum.LOST)}`,
    );
    expect(
      within(dialog).getByRole('button', { name: RESOLVE_DIALOG.confirmLabel }),
    ).toBeInTheDocument();
  });

  it('should name the returned outcome in the dialog of a found item', async () => {
    const foundItem: LostItem = { ...OWN_OPEN_ITEM, lostAndFoundType: LostItemKindEnum.FOUND };
    listReturning([foundItem]);
    renderComponent();
    await screen.findByText(foundItem.name);

    await userEvent.click(
      screen.getByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.FOUND] }),
    );

    const dialog = await screen.findByRole('dialog', {
      name: RESOLVE_LABEL[LostItemKindEnum.FOUND],
    });

    expect(within(dialog).getByText(foundItem.name).parentElement).toHaveTextContent(
      `${RESOLVE_DIALOG.messagePrefix}${foundItem.name}${lostItemResolveSuffix(LostItemKindEnum.FOUND)}`,
    );
  });

  it('should fall back to the status wording when the api sends an unknown kind', async () => {
    const unknownKind = 'Sonda' as unknown as LostItemKindEnum;
    const item: LostItem = { ...OWN_OPEN_ITEM, lostAndFoundType: unknownKind };
    listReturning([item]);
    renderComponent();
    await screen.findByText(item.name);

    await userEvent.click(screen.getByRole('button', { name: lostItemResolveLabel(unknownKind) }));

    const dialog = await screen.findByRole('dialog', { name: lostItemResolveLabel(unknownKind) });

    expect(within(dialog).getByText(item.name).parentElement).toHaveTextContent(
      `${RESOLVE_DIALOG.messagePrefix}${item.name}${lostItemResolveSuffix(unknownKind)}`,
    );
  });

  it('should keep the owner actions off the card of someone else', async () => {
    listReturning([LOST_ITEM]);

    renderComponent();

    await screen.findByText(LOST_ITEM.name);
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.edit }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.delete }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.LOST] }),
    ).not.toBeInTheDocument();
  });

  it('should leave a concluded item without any action of its own', async () => {
    listReturning([{ ...OWN_OPEN_ITEM, status: LostItemStatusEnum.RESOLVED }]);

    renderComponent();

    await screen.findByText(LOST_ITEM.name);
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.edit }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.delete }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.LOST] }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: RESTORE_LABEL })).not.toBeInTheDocument();
  });

  it('should offer only the way back on a deleted item', async () => {
    listReturning([
      {
        ...OWN_OPEN_ITEM,
        status: LostItemStatusEnum.DELETED,
        deletionReason: DeletionReasonEnum.INACTIVITY,
      },
    ]);

    renderComponent();

    await screen.findByText(LOST_ITEM.name);
    expect(screen.getByRole('button', { name: RESTORE_LABEL })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.edit }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.delete }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(DELETION_NOTE.inactivity)).toBeInTheDocument();
  });

  it('should name the ending after the kind of the item', async () => {
    listReturning([
      OWN_OPEN_ITEM,
      { ...OWN_OPEN_ITEM, id: 'outro', lostAndFoundType: LostItemKindEnum.FOUND },
    ]);

    renderComponent();

    await screen.findAllByText(LOST_ITEM.name);
    expect(
      screen.getByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.LOST] }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.FOUND] }),
    ).toBeInTheDocument();
  });

  // A palavra destrutiva e a de dispensar dividem a mesma caixa: o que separa uma
  // da outra é só o texto, então ele é o que o caso afirma.
  it('should put the confirming word apart from the dismissing one in the dialog', async () => {
    listReturning([OWN_OPEN_ITEM]);
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await userEvent.click(
      screen.getByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.LOST] }),
    );

    const dialog = within(await screen.findByRole('dialog'));
    expect(
      dialog.getByRole('heading', { name: RESOLVE_LABEL[LostItemKindEnum.LOST] }),
    ).toBeInTheDocument();
    expect(dialog.getByRole('button', { name: RESOLVE_DIALOG.confirmLabel })).toBeInTheDocument();
    expect(dialog.getByRole('button', { name: CONFIRMATION.dismissLabel })).toBeInTheDocument();
  });

  it('should keep the item as it is while the confirmation is not given', async () => {
    boardTracking(OWN_OPEN_ITEM);
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await userEvent.click(
      screen.getByRole('button', { name: RESOLVE_LABEL[LostItemKindEnum.LOST] }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: CONFIRMATION.dismissLabel }));

    // O diálogo sai por transição: some da árvore depois do clique, não nele.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(card().getAllByText(STATUS_TAG_LABEL.open)).toHaveLength(1);
  });

  it('should restore the item without asking anything first', async () => {
    boardTracking({
      ...OWN_OPEN_ITEM,
      status: LostItemStatusEnum.DELETED,
      deletionReason: DeletionReasonEnum.USER,
    });
    renderComponent();
    await filterByStatus(STATUS_TAG_LABEL.deleted);
    await screen.findByText(LOST_ITEM.name);

    await userEvent.click(screen.getByRole('button', { name: RESTORE_LABEL }));

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.restoreSucceeded)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should report a failure to conclude the item', async () => {
    listReturning([OWN_OPEN_ITEM]);
    server.use(
      http.patch(`${LOST_ITEMS_URL}/:itemId`, () => new HttpResponse(null, { status: 500 })),
    );
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await confirmAction(RESOLVE_LABEL[LostItemKindEnum.LOST], RESOLVE_DIALOG.confirmLabel);

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.resolveFailed)).toBeInTheDocument();
  });

  it('should report a failure to delete the item', async () => {
    listReturning([OWN_OPEN_ITEM]);
    server.use(
      http.delete(`${LOST_ITEMS_URL}/:itemId`, () => new HttpResponse(null, { status: 500 })),
    );
    renderComponent();
    await screen.findByText(LOST_ITEM.name);

    await userEvent.click(screen.getByRole('button', { name: LOST_ITEM_ACTION_LABELS.delete }));

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.deleteFailed)).toBeInTheDocument();
  });

  it('should open the dialog filled in when the item is edited from the card', async () => {
    listReturning([OWN_OPEN_ITEM]);

    renderComponent();
    await screen.findByText(OWN_OPEN_ITEM.name);
    await userEvent.click(screen.getByRole('button', { name: LOST_ITEM_ACTION_LABELS.edit }));

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByRole('heading', { name: EDIT_MODE.title })).toBeInTheDocument();
    expect(dialog.getByDisplayValue(OWN_OPEN_ITEM.name)).toBeInTheDocument();
  });

  describe('paginação e busca na URL', () => {
    const SECOND_PAGE_LABEL = 'Ir para a página 2';

    const manyItemName = (index: number) => `Item ${index}`;

    function manyItems(total: number) {
      return Array.from({ length: total }, (_, index) => ({
        ...LOST_ITEM,
        id: `item-${index}`,
        name: manyItemName(index),
      }));
    }

    it('should open with the fields already filled from the url', async () => {
      let asked: URL | null = null;
      listReturning([LOST_ITEM], (url) => {
        asked = url;
      });

      renderComponent('?busca=Garrafa&tipo=perdido&de=2026-08-01&ate=2026-08-05&meus=sim');
      await screen.findByText(LOST_ITEM.name);

      await waitFor(() =>
        expect(Object.fromEntries(asked!.searchParams)).toMatchObject({
          searchTerm: 'Garrafa',
          dateFrom: '2026-08-01',
          dateTo: '2026-08-05',
          onlyMine: 'true',
        }),
      );

      await openFilters();

      expect(await screen.findByDisplayValue('Garrafa')).toBeInTheDocument();
      expect(screen.getByDisplayValue('01/08/2026 - 05/08/2026')).toBeInTheDocument();
      expect(
        screen.getByRole('combobox', { name: new RegExp(FILTER_LABELS.owner) }),
      ).toHaveTextContent(OWNER_MINE_LABEL);
    });

    // O ponto ao lado do título precisa acompanhar o período e a autoria.
    it.each(['?de=2026-08-01', '?ate=2026-08-05', '?meus=sim'])(
      'should mark the filter as active when the url carries only %s',
      async (search) => {
        listReturning([LOST_ITEM]);

        renderComponent(search);
        await screen.findByText(LOST_ITEM.name);

        expect(await activeFilterDot()).not.toHaveClass('MuiBadge-invisible');
      },
    );

    it('should ask the api for the page the url names', async () => {
      let asked: URL | null = null;
      listReturning(manyItems(30), (url) => {
        asked = url;
      });

      renderComponent('?pagina=3');

      await waitFor(() => expect(asked!.searchParams.get('page')).toBe('3'));
    });

    it('should show the items the requested page holds, and not the ones before it', async () => {
      listReturning(manyItems(12));

      renderComponent('?pagina=2');

      expect(await screen.findByText(manyItemName(10))).toBeInTheDocument();
      expect(screen.queryByText(manyItemName(0))).not.toBeInTheDocument();
    });

    it('should put the chosen page in the url and leave the first one out', async () => {
      listReturning(manyItems(30));
      const router = renderComponent();

      await userEvent.click(await screen.findByRole('button', { name: SECOND_PAGE_LABEL }));

      await waitFor(() => expect(router.state.location.search).toBe('?pagina=2'));
    });

    it('should go back to the first page when a filter is applied', async () => {
      listReturning(manyItems(30));
      const router = renderComponent('?pagina=3');

      await openFilters();
      await userEvent.type(await screen.findByLabelText(FILTER_LABELS.searchTerm), 'Mochila');
      await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

      await waitFor(() => expect(router.state.location.search).toBe('?busca=Mochila'));
    });

    it('should fall back to the last page when the url asks beyond it', async () => {
      listReturning(manyItems(12));
      const router = renderComponent('?pagina=9');

      await waitFor(() => expect(router.state.location.search).toBe('?pagina=2'));
    });

    it('should keep the default status out of the url while showing it on the screen', async () => {
      listReturning([LOST_ITEM]);
      const router = renderComponent();

      expect(await screen.findByText(LOST_ITEM.name)).toBeInTheDocument();
      expect(router.state.location.search).toBe('');
    });
  });
});
