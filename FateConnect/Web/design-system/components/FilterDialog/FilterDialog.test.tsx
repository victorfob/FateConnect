import { render, screen, userEvent, waitFor, within } from '@app/test/testing-library';

import { FILTER_TITLE_PLURAL, FILTER_TITLE_SINGULAR } from './constants';
import { FilterDialog, type FilterDialogProps } from '.';

const SUBMIT_LABEL = 'Filtrar';
const CLEAR_LABEL = 'Limpar';
const FIELD_LABEL = 'Nome';
const SECOND_FIELD_LABEL = 'Local';

const DEFAULT_PROPS: FilterDialogProps = {
  submitLabel: SUBMIT_LABEL,
  clearLabel: CLEAR_LABEL,
  onSubmit: vi.fn(),
  onClear: vi.fn(),
  /**
   * Dois campos, como nas telas reais: com um só, o formulário submeteria por
   * Enter mesmo sem botão de submit, e o caso deixaria de provar a fiação. O
   * fragmento em volta é de propósito — é o que prova que a contagem desce nele.
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

const SINGLE_FIELD_PROPS: FilterDialogProps = {
  ...DEFAULT_PROPS,
  children: (
    <FilterDialog.Field>
      <input aria-label={FIELD_LABEL} />
    </FilterDialog.Field>
  ),
};

const renderComponent = (props = DEFAULT_PROPS) => render(<FilterDialog {...props} />);

const openDialog = async (triggerLabel: string = FILTER_TITLE_PLURAL) => {
  await userEvent.click(screen.getByRole('button', { name: triggerLabel }));

  return within(await screen.findByRole('dialog'));
};

describe('FilterDialog', () => {
  it('should name itself in the plural while it carries more than one field', async () => {
    renderComponent();

    expect(screen.getByRole('button', { name: FILTER_TITLE_PLURAL })).toBeInTheDocument();

    const dialog = await openDialog();

    expect(dialog.getByRole('heading', { name: FILTER_TITLE_PLURAL })).toBeInTheDocument();
  });

  it('should name itself in the singular while it carries a single field', async () => {
    renderComponent(SINGLE_FIELD_PROPS);

    expect(screen.getByRole('button', { name: FILTER_TITLE_SINGULAR })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: FILTER_TITLE_PLURAL })).not.toBeInTheDocument();

    const dialog = await openDialog(FILTER_TITLE_SINGULAR);

    expect(dialog.getByRole('heading', { name: FILTER_TITLE_SINGULAR })).toBeInTheDocument();
  });

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
