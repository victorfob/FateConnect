import { render, screen, userEvent } from '@app/test/testing-library';
import { narrowDeclarationsFor } from '@app/test/utils/styleSheetRules';

import { PHOTO_FIELD_TEXTS } from './constants';
import { PhotoField, type PhotoFieldProps } from '.';

/** O arquivo de `photo` lido como `data:`: é assim que a prévia chega à tela. */
const CHOSEN_PREVIEW = 'data:image/png;base64,Y29udGXDumRv';
const STORED_URL = 'blob:https://fateconnect.test/guardada';
const FIELD_LABEL = 'Foto';
const STORED_PREVIEW = { src: STORED_URL, alt: 'Foto do item' };
const SMALL_BUTTON_HEIGHT = '32px';

const onChange = vi.fn();

const DEFAULT_PROPS: PhotoFieldProps = {
  label: FIELD_LABEL,
  value: null,
  onChange,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<PhotoField {...props} />);

const photo = new File(['conteúdo'], 'print.png', { type: 'image/png' });

describe('PhotoField', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should offer picking a photo and say what it accepts', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeInTheDocument();
    expect(screen.getByText(PHOTO_FIELD_TEXTS.hint)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should hand over the chosen file', async () => {
    renderComponent();

    await userEvent.upload(screen.getByLabelText(FIELD_LABEL), photo);

    expect(onChange).toHaveBeenCalledWith(photo);
  });

  it('should preview the choice, offer replacing it and undo it', async () => {
    renderComponent({ ...DEFAULT_PROPS, value: photo });

    expect(await screen.findByRole('img', { name: PHOTO_FIELD_TEXTS.previewAlt })).toHaveAttribute(
      'src',
      CHOSEN_PREVIEW,
    );
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.replace })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('should drop what is shown, the stored photo included, when the screen allows it', async () => {
    const onRemoveStored = vi.fn();
    renderComponent({
      ...DEFAULT_PROPS,
      value: photo,
      storedPreview: STORED_PREVIEW,
      onRemoveStored,
    });

    await userEvent.click(await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onRemoveStored).toHaveBeenCalledOnce();
  });

  it('should offer removing the stored photo alone when the screen allows it', async () => {
    const onRemoveStored = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, storedPreview: STORED_PREVIEW, onRemoveStored });

    await userEvent.click(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(onRemoveStored).toHaveBeenCalledOnce();
  });

  it('should leave the stored photo alone when only the new choice is dropped', async () => {
    const onRemoveStored = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, value: photo, onRemoveStored });

    await userEvent.click(await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.remove }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onRemoveStored).not.toHaveBeenCalled();
  });

  it('should show what is already stored, with no way to remove it unless the screen allows it', () => {
    renderComponent({ ...DEFAULT_PROPS, storedPreview: STORED_PREVIEW });

    expect(screen.getByRole('img', { name: STORED_PREVIEW.alt })).toHaveAttribute(
      'src',
      STORED_URL,
    );
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.replace })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: PHOTO_FIELD_TEXTS.remove }),
    ).not.toBeInTheDocument();
  });

  it('should replace the hint with the error while there is one', () => {
    renderComponent({ ...DEFAULT_PROPS, error: 'A foto deve ser JPG, PNG ou WebP' });

    expect(screen.getByText('A foto deve ser JPG, PNG ou WebP')).toBeInTheDocument();
    expect(screen.queryByText(PHOTO_FIELD_TEXTS.hint)).not.toBeInTheDocument();
  });

  /** O botão é o alvo visível; quem abre o seletor do sistema é a entrada escondida. */
  it('should open the system picker from the visible button', async () => {
    const openPicker = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick }));

    expect(openPicker).toHaveBeenCalled();
    openPicker.mockRestore();
  });

  it('should refuse to pick while disabled', () => {
    renderComponent({ ...DEFAULT_PROPS, disabled: true });

    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.pick })).toBeDisabled();
  });

  it('should draw both photo actions with the small button', async () => {
    renderComponent({ ...DEFAULT_PROPS, value: photo });

    expect(await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.replace })).toHaveStyle({
      minHeight: SMALL_BUTTON_HEIGHT,
    });
    expect(screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove })).toHaveStyle({
      minHeight: SMALL_BUTTON_HEIGHT,
    });
  });

  it('should stretch the photo actions to the edge of the fields below md', async () => {
    renderComponent({ ...DEFAULT_PROPS, value: photo });

    const actions = (await screen.findByRole('button', { name: PHOTO_FIELD_TEXTS.replace }))
      .parentElement;

    expect(actions).toContainElement(
      screen.getByRole('button', { name: PHOTO_FIELD_TEXTS.remove }),
    );
    expect(narrowDeclarationsFor(actions)).toContain('flex:1');
  });
});
