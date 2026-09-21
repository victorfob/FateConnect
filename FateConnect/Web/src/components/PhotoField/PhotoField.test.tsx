import { render, screen, userEvent } from '@app/test/testing-library';

import { PhotoField, type PhotoFieldProps } from '.';

const PREVIEW_URL = 'blob:https://fateconnect.test/preview';
const STORED_URL = 'blob:https://fateconnect.test/guardada';

const LABELS = {
  field: 'Foto',
  hint: 'JPG, PNG ou WebP, até 5 MB.',
  pick: 'Escolher foto',
  replace: 'Trocar foto',
  remove: 'Remover foto',
  previewAlt: 'Prévia da foto escolhida',
};

const onChange = vi.fn();

const DEFAULT_PROPS: PhotoFieldProps = {
  labels: LABELS,
  accept: 'image/png',
  value: null,
  onChange,
};

const renderComponent = (props = DEFAULT_PROPS) => render(<PhotoField {...props} />);

const photo = new File(['conteúdo'], 'print.png', { type: 'image/png' });

describe('PhotoField', () => {
  beforeEach(() => {
    // jsdom não implementa a fábrica de URL de objeto, e é dela que sai a prévia.
    URL.createObjectURL = vi.fn(() => PREVIEW_URL);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should offer picking a photo and say what it accepts', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: LABELS.pick })).toBeInTheDocument();
    expect(screen.getByText(LABELS.hint)).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should hand over the chosen file', async () => {
    renderComponent();

    await userEvent.upload(screen.getByLabelText(LABELS.field), photo);

    expect(onChange).toHaveBeenCalledWith(photo);
  });

  it('should preview the choice, offer replacing it and undo it', async () => {
    renderComponent({ ...DEFAULT_PROPS, value: photo });

    expect(screen.getByRole('img', { name: LABELS.previewAlt })).toHaveAttribute(
      'src',
      PREVIEW_URL,
    );
    expect(screen.getByRole('button', { name: LABELS.replace })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: LABELS.remove }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  /** O que já está guardado se troca, não se apaga: não há o que desfazer. */
  it('should show what is already stored, with no way to remove it', () => {
    renderComponent({
      ...DEFAULT_PROPS,
      storedPreview: { src: STORED_URL, alt: 'Foto do item' },
    });

    expect(screen.getByRole('img', { name: 'Foto do item' })).toHaveAttribute('src', STORED_URL);
    expect(screen.getByRole('button', { name: LABELS.replace })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: LABELS.remove })).not.toBeInTheDocument();
  });

  it('should replace the hint with the error while there is one', () => {
    renderComponent({ ...DEFAULT_PROPS, error: 'A foto deve ser JPG, PNG ou WebP' });

    expect(screen.getByText('A foto deve ser JPG, PNG ou WebP')).toBeInTheDocument();
    expect(screen.queryByText(LABELS.hint)).not.toBeInTheDocument();
  });

  /** O botão é o alvo visível; quem abre o seletor do sistema é a entrada escondida. */
  it('should open the system picker from the visible button', async () => {
    const openPicker = vi.spyOn(HTMLInputElement.prototype, 'click');
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: LABELS.pick }));

    expect(openPicker).toHaveBeenCalled();
    openPicker.mockRestore();
  });

  it('should refuse to pick while disabled', () => {
    renderComponent({ ...DEFAULT_PROPS, disabled: true });

    expect(screen.getByRole('button', { name: LABELS.pick })).toBeDisabled();
  });
});
