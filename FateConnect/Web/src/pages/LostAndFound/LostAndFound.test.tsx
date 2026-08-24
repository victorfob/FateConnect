import { createMemoryRouter, RouterProvider } from 'react-router';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { RoutePathEnum } from '@app/routes/paths';
import {
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
} from '@app/services/lostAndFound/types';
import { render, screen, userEvent, waitFor } from '@app/test/testing-library';

import { OWN_ITEM_LABEL } from './components/LostItemCard/LostItemTags/constants';
import { FILTER_LABELS, FILTER_SUBMIT_LABEL } from './components/LostItemFilter/constants';
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

function listReturning(items: LostItem[], onRequest?: (url: URL) => void) {
  server.use(
    http.get(LOST_ITEMS_URL, ({ request }) => {
      onRequest?.(new URL(request.url));

      return HttpResponse.json(items);
    }),
  );
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
});
