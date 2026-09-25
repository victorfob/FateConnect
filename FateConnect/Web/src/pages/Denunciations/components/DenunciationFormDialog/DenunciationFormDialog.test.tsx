import { http, HttpResponse } from 'msw';

import { server } from '@app/mocks/server';
import { DENUNCIATION_CATEGORY_OPTIONS } from '@app/pages/Denunciations/helpers/denunciationCategory';
import { DenunciationCategoryEnum } from '@app/services/denunciations/types';
import { fireEvent, render, screen, userEvent, waitFor } from '@app/test/testing-library';

import {
  CONFIDENTIAL_HINT,
  DENUNCIATION_FORM,
  DENUNCIATION_FORM_LABELS,
  DENUNCIATION_FORM_MESSAGES,
  PHOTO_FIELD_LABELS,
} from './constants';
import { DenunciationFormDialog, type DenunciationFormDialogProps } from '.';

const DENUNCIATIONS_URL = 'https://api.fateconnect.test/denunciations';

const CREATED = 201;
const SERVER_ERROR = 500;

const CHOSEN_CATEGORY = DenunciationCategoryEnum.RECKLESS_DRIVING;
const CHOSEN_CATEGORY_LABEL = DENUNCIATION_CATEGORY_OPTIONS.find(
  (option) => option.value === CHOSEN_CATEGORY,
)!.label;

const TYPED_DESCRIPTION = 'A pessoa dirigiu acima da velocidade no trajeto inteiro.';

/**
 * A API recebe `[FromForm]`, e ler o corpo como formulário é o que faz o stub
 * reprovar um JSON — como ela reprovaria.
 */
async function fieldsOf(request: Request): Promise<Record<string, FormDataEntryValue>> {
  return Object.fromEntries(await request.formData());
}

const PREVIEW_URL = 'blob:https://fateconnect.test/preview';

const onClose = vi.fn();

const DEFAULT_PROPS: DenunciationFormDialogProps = { open: true, onClose };

const renderComponent = (props = DEFAULT_PROPS) => render(<DenunciationFormDialog {...props} />);

const descriptionField = () =>
  screen.getByRole('textbox', { name: new RegExp(DENUNCIATION_FORM_LABELS.description) });

const submitButton = () => screen.getByRole('button', { name: DENUNCIATION_FORM.submitLabel });

const confidentialToggle = () =>
  screen.getByRole('switch', { name: DENUNCIATION_FORM_LABELS.confidential });

async function fillTheForm() {
  await userEvent.click(
    screen.getByRole('combobox', { name: new RegExp(DENUNCIATION_FORM_LABELS.category) }),
  );
  await userEvent.click(await screen.findByRole('option', { name: CHOSEN_CATEGORY_LABEL }));
  await userEvent.type(descriptionField(), TYPED_DESCRIPTION);
}

describe('DenunciationFormDialog', () => {
  beforeEach(() => {
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a prévia.
    URL.createObjectURL = vi.fn(() => PREVIEW_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should open blank, with the name showing to whoever reviews it', async () => {
    renderComponent();

    expect(
      await screen.findByRole('heading', { name: DENUNCIATION_FORM.title }),
    ).toBeInTheDocument();
    expect(descriptionField()).toHaveValue('');
    expect(confidentialToggle()).not.toBeChecked();
  });

  it('should hold the description to its limit and show how much of it is used', async () => {
    renderComponent();

    await userEvent.type(descriptionField(), TYPED_DESCRIPTION);

    expect(descriptionField()).toHaveAttribute('maxlength', '500');
    expect(screen.getByText('56/500', { ignore: '[role="status"]' })).toBeInTheDocument();
  });

  /**
   * Sigilo não é anonimato, e quem conta a diferença é a frase — que só aparece
   * para quem escolheu a opção.
   */
  it('should say what confidential really means, only once it is chosen', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });

    expect(screen.queryByText(CONFIDENTIAL_HINT)).not.toBeInTheDocument();

    await userEvent.click(confidentialToggle());

    expect(await screen.findByText(CONFIDENTIAL_HINT)).toBeInTheDocument();
  });

  it('should send the denunciation the form describes', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(DENUNCIATIONS_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: 'nova' }, { status: CREATED });
      }),
    );
    renderComponent();
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });

    await fillTheForm();
    await userEvent.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fields).toEqual({
      Category: CHOSEN_CATEGORY,
      Description: TYPED_DESCRIPTION,
      IsAnonymous: 'false',
    });
    expect(await screen.findByText(DENUNCIATION_FORM.succeeded)).toBeInTheDocument();
  });

  it('should carry the choice of hiding the name', async () => {
    let fields: Record<string, FormDataEntryValue> | null = null;
    server.use(
      http.post(DENUNCIATIONS_URL, async ({ request }) => {
        fields = await fieldsOf(request);

        return HttpResponse.json({ id: 'nova' }, { status: CREATED });
      }),
    );
    renderComponent();
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });

    await fillTheForm();
    await userEvent.click(confidentialToggle());
    await userEvent.click(submitButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(fields).toMatchObject({ IsAnonymous: 'true' });
  });

  it('should refuse a description shorter than the entity accepts', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });

    await userEvent.type(descriptionField(), 'sumiu');
    await userEvent.click(submitButton());

    expect(
      await screen.findByText(DENUNCIATION_FORM_MESSAGES.descriptionTooShort),
    ).toBeInTheDocument();
    expect(screen.getByText(DENUNCIATION_FORM_MESSAGES.categoryRequired)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should refuse a photo the API would not accept, without losing the rest', async () => {
    renderComponent();
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });
    await fillTheForm();

    // Pelo `userEvent` o arquivo nem chega ao campo: o atributo `accept` o
    // descarta antes. Quem tem de barrá-lo é a validação, e é ela que este caso
    // exercita — o atributo é conveniência, não a regra.
    fireEvent.change(screen.getByLabelText(PHOTO_FIELD_LABELS.field), {
      target: { files: [new File(['conteúdo'], 'laudo.pdf', { type: 'application/pdf' })] },
    });

    expect(
      await screen.findByText(DENUNCIATION_FORM_MESSAGES.photoFormatInvalid),
    ).toBeInTheDocument();
    expect(descriptionField()).toHaveValue(TYPED_DESCRIPTION);
  });

  it('should keep the dialog open when the api fails, with what was typed', async () => {
    server.use(
      http.post(DENUNCIATIONS_URL, () => new HttpResponse(null, { status: SERVER_ERROR })),
    );
    renderComponent();
    await screen.findByRole('heading', { name: DENUNCIATION_FORM.title });

    await fillTheForm();
    await userEvent.click(submitButton());

    expect(await screen.findByText(DENUNCIATION_FORM.failed)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(descriptionField()).toHaveValue(TYPED_DESCRIPTION);
  });
});
