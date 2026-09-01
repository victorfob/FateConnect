import { format } from 'date-fns';
import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import {
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
  type LostItemInput,
} from '@app/services/lostAndFound/types';
import { fireEvent, render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { toApiDate } from '@app/utils/apiDate';

import {
  EDIT_MODE,
  LOST_ITEM_FORM_LABELS,
  MAX_PHOTO_BYTES,
  PHOTO_ACTIONS,
  REGISTER_MODE,
} from './constants';
import { LostItemFormDialog, type LostItemFormDialogProps } from '.';

const LOST_AND_FOUND_URL = 'https://api.fateconnect.test/achado';

const PREVIEW_URL = 'blob:https://fateconnect.test/preview';

const OCCURRED_AT = new Date(2026, 7, 11);
/** O seletor do MUI recebe a data seção a seção, na ordem de pt-BR. */
const TYPED_DATE = format(OCCURRED_AT, 'ddMMyyyy');

const LOST_ITEM: LostItem = {
  id: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  nome: 'Carteira preta',
  tipo: LostItemKindEnum.LOST,
  local: 'Biblioteca',
  dataOcorrido: '2026-08-11T00:00:00',
  descricao: 'Carteira de couro preta com documentos.',
  fotoUrl: null,
  situacao: LostItemStatusEnum.OPEN,
  motivoCancelamento: null,
  meuItem: true,
  dataCadastro: '2026-08-12T00:00:00',
};

const onClose = vi.fn();

const DEFAULT_PROPS: LostItemFormDialogProps = { open: true, onClose, item: undefined };

const renderComponent = (props = DEFAULT_PROPS) => render(<LostItemFormDialog {...props} />);

const nameField = () =>
  screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.name) });

const photoInput = () => screen.getByLabelText(LOST_ITEM_FORM_LABELS.photo);

function photoOf(fileName: string, type: string, sizeInBytes?: number): File {
  const photo = new File(['conteúdo'], fileName, { type });
  if (sizeInBytes !== undefined) Object.defineProperty(photo, 'size', { value: sizeInBytes });

  return photo;
}

describe('LostItemFormDialog', () => {
  beforeEach(() => {
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a prévia.
    URL.createObjectURL = vi.fn(() => PREVIEW_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register an item when it gets no item to edit', async () => {
    renderComponent();

    expect(await screen.findByRole('heading', { name: REGISTER_MODE.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: REGISTER_MODE.submitLabel })).toBeInTheDocument();
    expect(nameField()).toHaveValue('');
  });

  it('should edit the item it gets, already filled in', async () => {
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });

    expect(await screen.findByRole('heading', { name: EDIT_MODE.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: EDIT_MODE.submitLabel })).toBeInTheDocument();
    expect(nameField()).toHaveValue(LOST_ITEM.nome);
    expect(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.place) }),
    ).toHaveValue(LOST_ITEM.local);
    expect(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.description) }),
    ).toHaveValue(LOST_ITEM.descricao);
  });

  it('should refuse to submit an empty form and say what is missing', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });
    let requested = false;
    server.use(
      http.post(LOST_AND_FOUND_URL, () => {
        requested = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: REGISTER_MODE.submitLabel }));

    expect(await screen.findByText(/nome deve ter ao menos/i)).toBeInTheDocument();
    expect(screen.getByText(/local deve ter ao menos/i)).toBeInTheDocument();
    expect(requested).toBe(false);
  });

  it('should send the whole item on update, so the description survives', async () => {
    let body: LostItemInput | null = null;
    server.use(
      http.put(`${LOST_AND_FOUND_URL}/:id`, async ({ request }) => {
        body = (await request.json()) as LostItemInput;
        return HttpResponse.json({ id: LOST_ITEM.id });
      }),
    );
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      nome: LOST_ITEM.nome,
      tipo: LOST_ITEM.tipo,
      local: LOST_ITEM.local,
      dataOcorrido: '2026-08-11',
      descricao: LOST_ITEM.descricao,
    });
  });

  it('should keep the dialog open when the api fails, with what was typed', async () => {
    server.use(
      http.put(`${LOST_AND_FOUND_URL}/:id`, () => new HttpResponse(null, { status: 500 })),
    );
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    expect(await screen.findByText(EDIT_MODE.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(nameField()).toHaveValue(LOST_ITEM.nome);
  });

  it('should register the item the form describes', async () => {
    let body: LostItemInput | null = null;
    server.use(
      http.post(LOST_AND_FOUND_URL, async ({ request }) => {
        body = (await request.json()) as LostItemInput;
        return HttpResponse.json({ id: 'novo' }, { status: 201 });
      }),
    );
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });

    await userEvent.type(nameField(), 'Garrafa térmica');
    await userEvent.click(
      screen.getByRole('combobox', { name: new RegExp(LOST_ITEM_FORM_LABELS.kind) }),
    );
    await userEvent.click(await screen.findByRole('option', { name: LostItemKindEnum.FOUND }));
    await userEvent.type(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.place) }),
      'Bloco C',
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.occurredOn) }),
      TYPED_DATE,
    );

    await userEvent.click(screen.getByRole('button', { name: REGISTER_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      nome: 'Garrafa térmica',
      tipo: LostItemKindEnum.FOUND,
      local: 'Bloco C',
      dataOcorrido: toApiDate(OCCURRED_AT),
      descricao: '',
    });
  });

  it('should show the chosen photo and let the user drop it', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });

    await userEvent.upload(photoInput(), photoOf('achado.png', 'image/png'));

    const preview = await screen.findByRole('img', { name: PHOTO_ACTIONS.previewAlt });
    expect(preview).toHaveAttribute('src', PREVIEW_URL);
    expect(screen.getByRole('button', { name: PHOTO_ACTIONS.replace })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: PHOTO_ACTIONS.remove }));

    await waitFor(() =>
      expect(screen.queryByRole('img', { name: PHOTO_ACTIONS.previewAlt })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: PHOTO_ACTIONS.pick })).toBeInTheDocument();
  });

  it('should refuse a photo in a format the server will not take', async () => {
    let requested = false;
    server.use(
      http.post(LOST_AND_FOUND_URL, () => {
        requested = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });

    // Pelo `userEvent` o arquivo nem chega ao campo: o atributo `accept` o
    // descarta antes. Quem tem de barrá-lo é a validação, e é ela que este caso
    // exercita — o atributo é conveniência, não a regra.
    fireEvent.change(photoInput(), { target: { files: [photoOf('achado.gif', 'image/gif')] } });

    expect(await screen.findByText(/foto deve ser JPG, PNG ou WebP/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: REGISTER_MODE.submitLabel }));

    expect(requested).toBe(false);
  });

  it('should refuse a photo heavier than the limit', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });

    await userEvent.upload(photoInput(), photoOf('achado.png', 'image/png', MAX_PHOTO_BYTES + 1));

    expect(await screen.findByText(/foto deve ter no máximo/i)).toBeInTheDocument();
  });
});
