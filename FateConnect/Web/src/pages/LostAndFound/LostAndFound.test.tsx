import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import {
  CancellationReasonEnum,
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
} from '@app/services/lostAndFound/types';
import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { OWN_ITEM_LABEL } from './components/LostItemCard/constants';
import {
  DELETE_DIALOG,
  LOST_ITEM_ACTION_LABELS,
} from './components/LostItemCard/LostItemActions/constants';
import {
  REOPEN_LABEL,
  RESOLVE_DIALOG,
} from './components/LostItemCard/LostItemStatusAction/constants';
import {
  FILTER_LABELS,
  FILTER_PANEL_TITLE,
  FILTER_SUBMIT_LABEL,
} from './components/LostItemFilter/constants';
import { REGISTER_MODE } from './components/LostItemFormDialog/constants';
import * as C from './constants';
import { LostAndFound } from '.';

const LOST_ITEMS_URL = 'https://api.fateconnect.test/achado';

const LOST_ITEM: LostItem = {
  id: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  nome: 'Carteira preta',
  tipo: LostItemKindEnum.LOST,
  local: 'Biblioteca',
  dataOcorrido: '2026-08-11T00:00:00',
  descricao: 'Carteira de couro preta com documentos e cartões.',
  fotoUrl: null,
  situacao: LostItemStatusEnum.OPEN,
  motivoCancelamento: null,
  meuItem: false,
  dataCadastro: '2026-08-12T00:00:00',
};

/** O ponto do painel não tem papel de acessibilidade: chega-se a ele pelo título. */
function activeFilterDot(title: string) {
  return screen.getByText(title).closest('.MuiBadge-root')?.querySelector('.MuiBadge-badge');
}

function listReturning(items: LostItem[], onRequest?: (url: URL) => void) {
  server.use(
    http.get(LOST_ITEMS_URL, ({ request }) => {
      onRequest?.(new URL(request.url));

      return HttpResponse.json(items);
    }),
  );
}

const NO_CONTENT = 204;

const STATUS_TAG_LABEL = { open: 'Aberto', resolved: 'Concluído', cancelled: 'Cancelado' };

const RESOLVE_LABEL = { lost: 'Marcar como encontrado', found: 'Marcar como devolvido' };

const CANCELLATION_NOTE = {
  owner: 'Cancelado por quem cadastrou.',
  inactivity: 'Cancelado por inatividade.',
};

const OWN_OPEN_ITEM: LostItem = { ...LOST_ITEM, meuItem: true };

/**
 * Mural que guarda o que as ações mudaram e respeita o filtro de situação, como
 * a API faz: sem isso o item continuaria à vista depois de sair de Aberto.
 */
function boardTracking(initial: LostItem) {
  let current: LostItem = initial;

  server.use(
    http.get(LOST_ITEMS_URL, ({ request }) => {
      const wanted = new URL(request.url).searchParams.get('Situacao');
      if (wanted && wanted !== current.situacao) return HttpResponse.json([]);

      return HttpResponse.json([current]);
    }),
    http.patch<{ itemId: string }, { situacao: LostItemStatusEnum }>(
      `${LOST_ITEMS_URL}/:itemId/situacao`,
      async ({ request }) => {
        const { situacao } = await request.json();
        current = { ...current, situacao, motivoCancelamento: null };

        return new HttpResponse(null, { status: NO_CONTENT });
      },
    ),
    http.delete(`${LOST_ITEMS_URL}/:itemId`, () => {
      current = {
        ...current,
        situacao: LostItemStatusEnum.CANCELLED,
        motivoCancelamento: CancellationReasonEnum.OWNER,
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

async function filterByStatus(optionLabel: string) {
  await userEvent.click(screen.getByRole('combobox', { name: new RegExp(FILTER_LABELS.status) }));
  await userEvent.click(
    within(screen.getByRole('listbox')).getByRole('option', { name: optionLabel }),
  );
  await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));
}

function renderComponent() {
  const router = createMemoryRouter(
    [
      { path: RoutePathEnum.LOST_AND_FOUND, element: <LostAndFound /> },
      { path: RoutePathEnum.MENU, element: <div>menu</div> },
    ],
    { initialEntries: [RoutePathEnum.LOST_AND_FOUND] },
  );
  render(<RouterProvider router={router} />);

  return router;
}

describe('LostAndFound', () => {
  it('should render the title as the page heading and the item on the board', async () => {
    listReturning([LOST_ITEM]);

    renderComponent();

    expect(screen.getByRole('heading', { name: C.LOST_AND_FOUND_TITLE })).toBeInTheDocument();
    expect(await screen.findByText(LOST_ITEM.nome)).toBeInTheDocument();
    expect(screen.getByText(LOST_ITEM.local)).toBeInTheDocument();
    expect(screen.getByText(LOST_ITEM.descricao!)).toBeInTheDocument();
  });

  it('should open the board on the items that are still open', async () => {
    let received: URL | null = null;
    listReturning([LOST_ITEM], (url) => {
      received = url;
    });

    renderComponent();

    await waitFor(() => expect(received).not.toBeNull());
    expect(received!.searchParams.get('Situacao')).toBe(LostItemStatusEnum.OPEN);
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

    await userEvent.type(screen.getByLabelText(FILTER_LABELS.name), 'Carteira');
    await userEvent.click(screen.getByRole('button', { name: FILTER_SUBMIT_LABEL }));

    await waitFor(() => expect(requestUrl!.searchParams.get('Nome')).toBe('Carteira'));
    expect(requestUrl!.searchParams.get('Situacao')).toBe(LostItemStatusEnum.OPEN);
    expect(activeFilterDot(FILTER_PANEL_TITLE)).not.toHaveClass('MuiBadge-invisible');
  });

  it('should leave the filter unmarked while only the open items are asked for', async () => {
    listReturning([]);

    renderComponent();

    await screen.findByText(C.EMPTY_LIST_MESSAGE);
    expect(activeFilterDot(FILTER_PANEL_TITLE)).toHaveClass('MuiBadge-invisible');
  });

  it('should mark only the item that belongs to the user', async () => {
    listReturning([{ ...LOST_ITEM, meuItem: true }]);

    renderComponent();

    await screen.findByText(LOST_ITEM.nome);
    expect(screen.queryAllByText(OWN_ITEM_LABEL)).not.toHaveLength(0);
  });

  it('should leave someone else item without the owner mark', async () => {
    listReturning([LOST_ITEM]);

    renderComponent();

    await screen.findByText(LOST_ITEM.nome);
    expect(screen.queryAllByText(OWN_ITEM_LABEL)).toHaveLength(0);
  });

  it('should not let the filter ask for a day that has not happened yet', async () => {
    // Data fixa para o dia seguinte cair no mesmo mês, em qualquer dia do ano.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 10));
    listReturning([]);
    renderComponent();
    await screen.findByText(C.EMPTY_LIST_MESSAGE);

    await userEvent.click(screen.getByRole('button', { name: /Escolha uma data/i }));

    const calendar = within(await screen.findByRole('grid'));
    expect(calendar.getByRole('gridcell', { name: '10' })).toBeEnabled();
    expect(calendar.getByRole('gridcell', { name: '11' })).toBeDisabled();

    vi.useRealTimers();
  });

  it('should tell lost from found by the icon on the card', async () => {
    listReturning([LOST_ITEM, { ...LOST_ITEM, id: 'outro', tipo: LostItemKindEnum.FOUND }]);

    renderComponent();

    await screen.findAllByText(LOST_ITEM.nome);
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

  it('should walk the item from open to cancelled, back to open and then to concluded', async () => {
    boardTracking(OWN_OPEN_ITEM);
    renderComponent();
    await screen.findByText(LOST_ITEM.nome);

    await confirmAction(LOST_ITEM_ACTION_LABELS.cancel, DELETE_DIALOG.confirmLabel);

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.cancelSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();

    await filterByStatus(STATUS_TAG_LABEL.cancelled);

    expect(await screen.findByText(LOST_ITEM.nome)).toBeInTheDocument();
    expect(card().getAllByText(STATUS_TAG_LABEL.cancelled)).not.toHaveLength(0);
    expect(card().getByText(CANCELLATION_NOTE.owner)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: REOPEN_LABEL }));

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.reopenSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();

    await filterByStatus(STATUS_TAG_LABEL.open);
    await screen.findByText(LOST_ITEM.nome);
    await confirmAction(RESOLVE_LABEL.lost, RESOLVE_DIALOG.confirmLabel);

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.resolveSucceeded)).toBeInTheDocument();
    expect(await screen.findByText(C.EMPTY_LIST_MESSAGE)).toBeInTheDocument();

    await filterByStatus(STATUS_TAG_LABEL.resolved);

    expect(await screen.findByText(LOST_ITEM.nome)).toBeInTheDocument();
    expect(card().getAllByText(STATUS_TAG_LABEL.resolved)).not.toHaveLength(0);
  });

  it('should keep the owner actions off the card of someone else', async () => {
    listReturning([LOST_ITEM]);

    renderComponent();

    await screen.findByText(LOST_ITEM.nome);
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.edit }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.cancel }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: RESOLVE_LABEL.lost })).not.toBeInTheDocument();
  });

  it('should leave a concluded item without any action of its own', async () => {
    listReturning([{ ...OWN_OPEN_ITEM, situacao: LostItemStatusEnum.RESOLVED }]);

    renderComponent();

    await screen.findByText(LOST_ITEM.nome);
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.edit }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.cancel }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: RESOLVE_LABEL.lost })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: REOPEN_LABEL })).not.toBeInTheDocument();
  });

  it('should offer only the way back on a cancelled item', async () => {
    listReturning([
      {
        ...OWN_OPEN_ITEM,
        situacao: LostItemStatusEnum.CANCELLED,
        motivoCancelamento: CancellationReasonEnum.INACTIVITY,
      },
    ]);

    renderComponent();

    await screen.findByText(LOST_ITEM.nome);
    expect(screen.getByRole('button', { name: REOPEN_LABEL })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.edit }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: LOST_ITEM_ACTION_LABELS.cancel }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(CANCELLATION_NOTE.inactivity)).toBeInTheDocument();
  });

  it('should name the ending after the kind of the item', async () => {
    listReturning([OWN_OPEN_ITEM, { ...OWN_OPEN_ITEM, id: 'outro', tipo: LostItemKindEnum.FOUND }]);

    renderComponent();

    await screen.findAllByText(LOST_ITEM.nome);
    expect(screen.getByRole('button', { name: RESOLVE_LABEL.lost })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: RESOLVE_LABEL.found })).toBeInTheDocument();
  });

  it('should keep the item as it is while the confirmation is not given', async () => {
    boardTracking(OWN_OPEN_ITEM);
    renderComponent();
    await screen.findByText(LOST_ITEM.nome);

    await userEvent.click(screen.getByRole('button', { name: LOST_ITEM_ACTION_LABELS.cancel }));
    const dialog = within(await screen.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: /Cancelar/ }));

    // O diálogo sai por transição: some da árvore depois do clique, não nele.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(card().getAllByText(STATUS_TAG_LABEL.open)).not.toHaveLength(0);
  });

  it('should reopen the item without asking anything first', async () => {
    boardTracking({
      ...OWN_OPEN_ITEM,
      situacao: LostItemStatusEnum.CANCELLED,
      motivoCancelamento: CancellationReasonEnum.OWNER,
    });
    renderComponent();
    await filterByStatus(STATUS_TAG_LABEL.cancelled);
    await screen.findByText(LOST_ITEM.nome);

    await userEvent.click(screen.getByRole('button', { name: REOPEN_LABEL }));

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.reopenSucceeded)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should report a failure to conclude the item', async () => {
    listReturning([OWN_OPEN_ITEM]);
    server.use(
      http.patch(
        `${LOST_ITEMS_URL}/:itemId/situacao`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    renderComponent();
    await screen.findByText(LOST_ITEM.nome);

    await confirmAction(RESOLVE_LABEL.lost, RESOLVE_DIALOG.confirmLabel);

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.resolveFailed)).toBeInTheDocument();
  });

  it('should report a failure to delete the item', async () => {
    listReturning([OWN_OPEN_ITEM]);
    server.use(
      http.delete(`${LOST_ITEMS_URL}/:itemId`, () => new HttpResponse(null, { status: 500 })),
    );
    renderComponent();
    await screen.findByText(LOST_ITEM.nome);

    await confirmAction(LOST_ITEM_ACTION_LABELS.cancel, DELETE_DIALOG.confirmLabel);

    expect(await screen.findByText(C.LOST_ITEM_LIST_MESSAGES.cancelFailed)).toBeInTheDocument();
  });
});
