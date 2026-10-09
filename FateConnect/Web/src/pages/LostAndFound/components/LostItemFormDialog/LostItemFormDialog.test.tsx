import { format } from 'date-fns';
import { http, HttpResponse } from 'msw';

import { MAX_PHOTO_BYTES, PHOTO_FIELD_TEXTS } from '@app/components/PhotoField/constants';
import { server } from '@app/mocks/server';
import { lostItemKindLabel } from '@app/pages/LostAndFound/helpers/lostItemKind';
import { apiClient } from '@app/services/httpClient';
import {
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
} from '@app/services/lostAndFound/types';
import { fireEvent, render, screen, userEvent, waitFor } from '@app/test/testing-library';
import { toApiDate } from '@app/utils/apiDate';

import { EDIT_MODE, LOST_ITEM_FORM_LABELS, REGISTER_MODE, STORED_PHOTO_ALT } from './constants';
import { LostItemFormDialog, type LostItemFormDialogProps } from '.';

const LOST_AND_FOUND_URL = 'https://api.fateconnect.test/lostandfound';

/**
 * A API recebe `[FromForm]` nos dois verbos de escrita, e ler o corpo como
 * formulário é o que faz o stub reprovar um JSON — como ela reprovaria.
 */
async function fieldsOf(request: Request): Promise<Record<string, FormDataEntryValue>> {
  return Object.fromEntries(await request.formData());
}

const STORED_PHOTO_OBJECT_URL = 'blob:https://fateconnect.test/guardada';
/** Basta ser corpo binário: o que a tela usa é o blob que o cliente devolve. */
const PNG_BYTES = '\x89PNG\r\n\x1a\n';

const OCCURRED_AT = new Date(2026, 7, 11);
/** O seletor do MUI recebe a data seção a seção, na ordem de pt-BR. */
const TYPED_DATE = format(OCCURRED_AT, 'ddMMyyyy');
const EDITED_NAME = 'Carteira marrom';

const LOST_ITEM: LostItem = {
  id: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  name: 'Carteira preta',
  lostAndFoundType: LostItemKindEnum.LOST,
  place: 'Biblioteca',
  ocurredOn: '2026-08-11T00:00:00',
  description: 'Carteira de couro preta com documentos.',
  imageUrl: null,
  thumbnailUrl: null,
  contact: {
    name: 'Marina Duarte',
    email: 'marina.duarte@example.com',
    phone: '(15) 99999-0001',
    thumbnailUrl: null,
  },
  status: LostItemStatusEnum.OPEN,
  deletionReason: null,
  isOwner: true,
  createdAt: '2026-08-12T00:00:00',
};

const STORED_PHOTO_PATH =
  'uploads/lostandfound/thumbnails/6f0b8e3a-1c2d-4e5f-8a9b-0c1d2e3f4a5b.webp';

const ITEM_WITH_PHOTO: LostItem = { ...LOST_ITEM, thumbnailUrl: STORED_PHOTO_PATH };

/** O item inteiro, como o salvar manda, sem `Image`: a remoção vai num campo próprio. */
const STORED_PHOTO_REMOVAL = {
  Name: LOST_ITEM.name,
  LostAndFoundType: LOST_ITEM.lostAndFoundType,
  Place: LOST_ITEM.place,
  OcurredOn: '2026-08-11',
  Description: LOST_ITEM.description,
  RemoveImage: 'true',
};

function storedPhotoServing() {
  server.use(
    http.get(
      `https://api.fateconnect.test/${STORED_PHOTO_PATH}`,
      () => new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': 'image/png' } }),
    ),
  );
}

const onClose = vi.fn();

const onContactRequired = vi.fn();

const DEFAULT_PROPS: LostItemFormDialogProps = {
  open: true,
  onClose,
  item: undefined,
  onContactRequired,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<LostItemFormDialog {...props} />);

const nameField = () =>
  screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.name) });

const photoInput = () => screen.getByLabelText(LOST_ITEM_FORM_LABELS.photo);

function photoOf(fileName: string, type: string, sizeInBytes?: number): File {
  const photo = new File(['conteúdo'], fileName, { type });
  if (sizeInBytes !== undefined) Object.defineProperty(photo, 'size', { value: sizeInBytes });

  return photo;
}

async function retypeName(name: string) {
  await userEvent.clear(nameField());
  await userEvent.type(nameField(), name);
}

async function fillNewItem() {
  await userEvent.type(nameField(), 'Garrafa térmica');
  await userEvent.click(
    screen.getByRole('combobox', { name: new RegExp(LOST_ITEM_FORM_LABELS.kind) }),
  );
  await userEvent.click(
    await screen.findByRole('option', { name: lostItemKindLabel(LostItemKindEnum.FOUND) }),
  );
  await userEvent.type(
    screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.place) }),
    'Bloco C',
  );
  await userEvent.type(
    screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.occurredOn) }),
    TYPED_DATE,
  );
}

describe('LostItemFormDialog', () => {
  beforeEach(() => {
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a foto guardada.
    URL.createObjectURL = vi.fn(() => STORED_PHOTO_OBJECT_URL);
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

  it('should open the registration with the submit released, since there is nothing to compare', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });

    expect(screen.getByRole('button', { name: REGISTER_MODE.submitLabel })).toBeEnabled();
  });

  it('should hold the save of an untouched item and release it once a field changes', async () => {
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });
    const save = screen.getByRole('button', { name: EDIT_MODE.submitLabel });

    expect(save).toBeDisabled();

    await retypeName(EDITED_NAME);

    expect(save).toBeEnabled();
  });

  it('should hold the save again once the name goes back to the stored one', async () => {
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });
    const save = screen.getByRole('button', { name: EDIT_MODE.submitLabel });
    await retypeName(EDITED_NAME);
    expect(save).toBeEnabled();

    await retypeName(LOST_ITEM.name);

    expect(save).toBeDisabled();
  });

  it('should count a chosen photo as a change, and dropping it as undoing it', async () => {
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });
    const save = screen.getByRole('button', { name: EDIT_MODE.submitLabel });

    await userEvent.upload(photoInput(), photoOf('achado.png', 'image/png'));

    expect(save).toBeEnabled();

    await userEvent.click(await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(save).toBeDisabled();
  });

  it('should edit the item it gets, already filled in', async () => {
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });

    expect(await screen.findByRole('heading', { name: EDIT_MODE.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: EDIT_MODE.submitLabel })).toBeInTheDocument();
    expect(nameField()).toHaveValue(LOST_ITEM.name);
    expect(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.place) }),
    ).toHaveValue(LOST_ITEM.place);
    expect(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.description) }),
    ).toHaveValue(LOST_ITEM.description);
  });

  it('should hold each text field to its limit and count the stored description', async () => {
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    expect(nameField()).toHaveAttribute('maxlength', '100');
    expect(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.place) }),
    ).toHaveAttribute('maxlength', '100');
    expect(
      screen.getByRole('textbox', { name: new RegExp(LOST_ITEM_FORM_LABELS.description) }),
    ).toHaveAttribute('maxlength', '300');
    expect(screen.getByText('39/300', { ignore: '[role="status"]' })).toBeInTheDocument();
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
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.patch(`${LOST_AND_FOUND_URL}/:itemId`, async ({ request }) => {
        fields = await fieldsOf(request);
        return HttpResponse.json({ id: LOST_ITEM.id });
      }),
    );
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });
    await retypeName(EDITED_NAME);

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fields).toEqual({
      Name: EDITED_NAME,
      LostAndFoundType: LOST_ITEM.lostAndFoundType,
      Place: LOST_ITEM.place,
      OcurredOn: '2026-08-11',
      Description: LOST_ITEM.description,
    });
  });

  it('should keep the dialog open when the api fails, with what was typed', async () => {
    server.use(
      http.patch(`${LOST_AND_FOUND_URL}/:itemId`, () => new HttpResponse(null, { status: 500 })),
    );
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });
    await retypeName(EDITED_NAME);

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    expect(await screen.findByText(EDIT_MODE.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(nameField()).toHaveValue(EDITED_NAME);
  });

  it('should close and hand over to the contact notice when the api asks for a contact', async () => {
    server.use(
      http.post(LOST_AND_FOUND_URL, () =>
        HttpResponse.json({ error: 'sem contato', code: 'ContactRequired' }, { status: 403 }),
      ),
    );
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });
    await fillNewItem();

    await userEvent.click(screen.getByRole('button', { name: REGISTER_MODE.submitLabel }));

    await waitFor(() => expect(onContactRequired).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByText(REGISTER_MODE.failed)).not.toBeInTheDocument();
  });

  it('should register the item the form describes', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(LOST_AND_FOUND_URL, async ({ request }) => {
        fields = await fieldsOf(request);
        return HttpResponse.json({ id: 'novo' }, { status: 201 });
      }),
    );
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });

    await fillNewItem();

    await userEvent.click(screen.getByRole('button', { name: REGISTER_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fields).toEqual({
      Name: 'Garrafa térmica',
      LostAndFoundType: LostItemKindEnum.FOUND,
      Place: 'Bloco C',
      OcurredOn: toApiDate(OCCURRED_AT),
      Description: '',
    });
  });

  // A foto observada no corpo entregue ao cliente, e não no stub: o `File` do
  // jsdom não atravessa o interceptador, e no navegador ele atravessa.
  it('should send the chosen photo in the same request as the item', async () => {
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: { id: LOST_ITEM.id } });
    const photo = photoOf('achado.png', 'image/png');
    renderComponent({ ...DEFAULT_PROPS, item: LOST_ITEM });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    await userEvent.upload(photoInput(), photo);
    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const [, body] = patch.mock.calls[0]!;
    expect((body as FormData).get('Image')).toBe(photo);

    patch.mockRestore();
  });

  it('should show the chosen photo and let the user drop it', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: REGISTER_MODE.title });

    await userEvent.upload(photoInput(), photoOf('achado.png', 'image/png'));

    const preview = await screen.findByRole('img', { name: PHOTO_FIELD_TEXTS.previewAlt });
    expect(preview.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.replace })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    await waitFor(() =>
      expect(
        screen.queryByRole('img', { name: PHOTO_FIELD_TEXTS.previewAlt }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeInTheDocument();
  });

  it('should bring the stored photo into the form, ready to be replaced or removed', async () => {
    storedPhotoServing();
    renderComponent({ ...DEFAULT_PROPS, item: ITEM_WITH_PHOTO });
    await screen.findByRole('heading', { name: EDIT_MODE.title });

    expect(await screen.findByRole('img', { name: STORED_PHOTO_ALT })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.replace })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove })).toBeInTheDocument();
  });

  it('should drop the stored photo only once the edit is saved', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.patch(`${LOST_AND_FOUND_URL}/:itemId`, async ({ request }) => {
        fields = await fieldsOf(request);
        return HttpResponse.json({ id: LOST_ITEM.id });
      }),
    );
    storedPhotoServing();
    renderComponent({ ...DEFAULT_PROPS, item: ITEM_WITH_PHOTO });
    await screen.findByRole('img', { name: STORED_PHOTO_ALT });

    await userEvent.click(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(screen.queryByRole('img', { name: STORED_PHOTO_ALT })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeInTheDocument();
    expect(fields).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fields).toEqual(STORED_PHOTO_REMOVAL);
  });

  it('should drop the newly chosen photo and the stored one in a single removal', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.patch(`${LOST_AND_FOUND_URL}/:itemId`, async ({ request }) => {
        fields = await fieldsOf(request);
        return HttpResponse.json({ id: LOST_ITEM.id });
      }),
    );
    storedPhotoServing();
    renderComponent({ ...DEFAULT_PROPS, item: ITEM_WITH_PHOTO });
    await screen.findByRole('img', { name: STORED_PHOTO_ALT });
    await userEvent.upload(photoInput(), photoOf('achado.png', 'image/png'));
    await screen.findByRole('img', { name: PHOTO_FIELD_TEXTS.previewAlt });

    await userEvent.click(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    await waitFor(() =>
      expect(
        screen.queryByRole('img', { name: PHOTO_FIELD_TEXTS.previewAlt }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: STORED_PHOTO_ALT })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: EDIT_MODE.submitLabel }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fields).toEqual(STORED_PHOTO_REMOVAL);
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
