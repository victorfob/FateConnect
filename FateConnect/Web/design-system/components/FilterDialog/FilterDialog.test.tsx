import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { FilterDialog, type FilterDialogProps } from '.';

const TRIGGER_LABEL = 'Filtros';
const TITLE = 'Filtrar a lista';
const SUBMIT_LABEL = 'Filtrar';
const CLEAR_LABEL = 'Limpar';
const FIELD_LABEL = 'Nome';
const SECOND_FIELD_LABEL = 'Local';

const DEFAULT_PROPS: FilterDialogProps = {
  triggerLabel: TRIGGER_LABEL,
  title: TITLE,
  submitLabel: SUBMIT_LABEL,
  clearLabel: CLEAR_LABEL,
  onSubmit: vi.fn(),
  onClear: vi.fn(),
  /**
   * Dois campos, como nas telas reais: com um só, o formulário submeteria por
   * Enter mesmo sem botão de submit, e o caso deixaria de provar a fiação.
   */
  children: (
    <>
      <FilterDialog.Field>
        <input aria-label={FIELD_LABEL} />
      </FilterDialog.Field>
      <FilterDialog.Field>
        <input aria-label={SECOND_FIELD_LABEL} />
      </FilterDialog.Field>
    </>
  ),
};

const renderComponent = (props = DEFAULT_PROPS) => render(<FilterDialog {...props} />);

const openDialog = async () => {
  await userEvent.click(screen.getByRole('button', { name: TRIGGER_LABEL }));

  return within(await screen.findByRole('dialog'));
};

describe('FilterDialog', () => {
  it('should keep the fields behind the trigger until it is asked for them', async () => {
    renderComponent();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const dialog = await openDialog();

    expect(dialog.getByRole('textbox', { name: FIELD_LABEL })).toBeInTheDocument();
  });

  it('should apply and close when the filter is submitted', async () => {
    const onSubmit = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onSubmit });

    const dialog = await openDialog();
    await userEvent.click(dialog.getByRole('button', { name: SUBMIT_LABEL }));

    expect(onSubmit).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('should leave the filter alone when the dialog is dismissed', async () => {
    const onSubmit = vi.fn();
    const onClear = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, active: true, onSubmit, onClear });

    await openDialog();
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });

  /**
   * O jsdom é o único ambiente que exercita isto: o painel do navegador não faz
   * submissão implícita, medido com formulário mínimo de controle. Fechar por
   * Enter faz o diálogo do MUI atualizar e suspender fora do `act` do teste, e o
   * guardião de console reprovaria o caso — então o silêncio é por medida, e
   * conferido: erro de qualquer outra natureza continua derrubando o teste.
   */
  it('should apply when Enter is pressed inside a field', async () => {
    const onSubmit = vi.fn();
    const capturados: string[] = [];
    const consoleError = vi.spyOn(console, 'error').mockImplementation((message) => {
      capturados.push(String(message));
    });
    renderComponent({ ...DEFAULT_PROPS, onSubmit });

    const dialog = await openDialog();
    await userEvent.type(dialog.getByRole('textbox', { name: FIELD_LABEL }), 'carteira{Enter}');

    expect(onSubmit).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(capturados.filter((message) => !message.includes('act'))).toEqual([]);
    consoleError.mockRestore();
  });

  it('should offer to clear only while a filter is standing', async () => {
    renderComponent();

    const withoutFilter = await openDialog();

    expect(withoutFilter.queryByRole('button', { name: CLEAR_LABEL })).not.toBeInTheDocument();
    expect(withoutFilter.getByRole('button', { name: SUBMIT_LABEL })).toBeInTheDocument();
  });

  it('should clear and close when the standing filter is dropped', async () => {
    const onClear = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, active: true, onClear });

    const dialog = await openDialog();
    await userEvent.click(dialog.getByRole('button', { name: CLEAR_LABEL }));

    expect(onClear).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
