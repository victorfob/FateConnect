import { createRef, useState } from 'react';

import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@app/test/testing-library';
import { themeModeStorage } from '@ds-root/ThemeProvider/storage/themeModeStorage';

import {
  DATE_PICKER_LABEL,
  DATE_TIME_PICKER_LABEL,
  HELP_TRIGGER_LABEL_PREFIX,
  TIME_PICKER_LABEL,
} from './constants';
import { Input, type InputProps } from '.';

const DEFAULT_PROPS: InputProps = { label: 'Destino' };

const renderComponent = (props = DEFAULT_PROPS) => render(<Input {...props} />);

/** O texto do rótulo sai duas vezes, e no `select` ele não é um `label`. */
const labelOf = (field: HTMLElement) =>
  field.closest('.MuiFormControl-root')?.querySelector('[data-shrink]');

describe('Input', () => {
  it('should name the field by its label', () => {
    renderComponent();

    expect(
      screen.getByRole('textbox', { name: DEFAULT_PROPS.label as string }),
    ).toBeInTheDocument();
  });

  it('should turn the error message into the field helper text', () => {
    renderComponent({ ...DEFAULT_PROPS, error: 'Informe o destino' });

    expect(screen.getByText('Informe o destino')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Destino/ })).toBeInvalid();
  });

  it('should hand the input element to the consumer ref, so it can be focused', () => {
    const inputRef = createRef<HTMLInputElement>();
    renderComponent({ ...DEFAULT_PROPS, ref: inputRef });

    act(() => inputRef.current?.focus());

    expect(inputRef.current?.tagName).toBe('INPUT');
    expect(inputRef.current).toHaveFocus();
  });

  it('should offer the time picker button only for a time field', () => {
    renderComponent({ ...DEFAULT_PROPS, label: 'Hora', type: 'time' });

    expect(screen.getByRole('button', { name: TIME_PICKER_LABEL })).toBeInTheDocument();
  });

  it('should keep the plain field without a picker button', () => {
    renderComponent();

    expect(screen.queryByRole('button', { name: TIME_PICKER_LABEL })).not.toBeInTheDocument();
  });

  it('should keep its own adornment next to the picker button', () => {
    renderComponent({
      ...DEFAULT_PROPS,
      label: 'Hora',
      type: 'time',
      endAdornment: <span>relógio externo</span>,
    });

    expect(screen.getByText('relógio externo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: TIME_PICKER_LABEL })).toBeInTheDocument();
  });

  it('should hold the label down until asked otherwise, so it can rise on focus', () => {
    renderComponent();

    expect(labelOf(screen.getByRole('textbox', { name: /Destino/ }))).toHaveAttribute(
      'data-shrink',
      'false',
    );
  });

  it('should raise the label when the value arrives from outside', () => {
    renderComponent({ ...DEFAULT_PROPS, shrinkLabel: true });

    expect(labelOf(screen.getByRole('textbox', { name: /Destino/ }))).toHaveAttribute(
      'data-shrink',
      'true',
    );
  });

  it('should cap the typed length when the field carries a mask', async () => {
    renderComponent({ ...DEFAULT_PROPS, label: 'Data de nascimento', maxLength: 10 });

    const field = screen.getByRole('textbox', { name: /Data de nascimento/ });
    await userEvent.type(field, '01/01/2000999');

    expect(field).toHaveValue('01/01/2000');
  });
});

const HELP_TEXT = 'Como escolher';
const HELP_FIELD_LABEL = 'Tipo';
const HELP_TRIGGER = `${HELP_TRIGGER_LABEL_PREFIX} ${HELP_FIELD_LABEL}`;

const helpTrigger = () => screen.getByRole('button', { name: HELP_TRIGGER });

describe('Input help', () => {
  const renderHelp = () => render(<Input label={HELP_FIELD_LABEL} helpText={HELP_TEXT} />);

  it('should keep the hint outside the label, which is what would hand the field the focus', () => {
    renderHelp();

    expect(helpTrigger().closest('label')).toBeNull();
    expect(labelOf(screen.getByRole('textbox', { name: /Tipo/ }))).not.toContainElement(
      helpTrigger(),
    );
  });

  it('should open the hint on a plain tap, which carries no pointer', async () => {
    renderHelp();

    fireEvent.click(helpTrigger());

    expect(await screen.findByRole('tooltip')).toHaveTextContent(HELP_TEXT);
  });

  it('should close the hint when the next tap lands outside', async () => {
    renderHelp();
    fireEvent.click(helpTrigger());
    expect(await screen.findByRole('tooltip')).toHaveTextContent(HELP_TEXT);

    fireEvent.click(document.body);

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('should leave the field alone, so asking for help does not raise the keyboard', async () => {
    renderHelp();

    await userEvent.click(helpTrigger());

    expect(helpTrigger()).toHaveFocus();
    expect(screen.getByRole('textbox', { name: /Tipo/ })).not.toHaveFocus();
  });

  it('should hand the hint to the keyboard, one stop after the field', async () => {
    renderHelp();

    await userEvent.tab();
    await userEvent.tab();

    expect(helpTrigger()).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(HELP_TEXT);
  });
});

describe('Input.Select', () => {
  const OPTIONS = [
    { value: '', label: 'Todas' },
    { value: 'a', label: 'Solidária' },
  ];

  it('should show the chosen option and offer the rest', async () => {
    render(<Input.Select label="Tipo" options={OPTIONS} value="a" onChange={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: /Tipo/ })).toHaveTextContent('Solidária');

    await userEvent.click(screen.getByRole('combobox', { name: /Tipo/ }));

    expect(await screen.findByRole('option', { name: 'Todas' })).toBeInTheDocument();
  });

  it('should keep the label raised, since the field always shows an option', () => {
    render(<Input.Select label="Tipo" options={OPTIONS} value="" onChange={vi.fn()} />);

    expect(labelOf(screen.getByRole('combobox', { name: /Tipo/ }))).toHaveAttribute(
      'data-shrink',
      'true',
    );
  });

  it('should carry the hint at the end of the field, in a single copy', async () => {
    render(
      <Input.Select
        label={HELP_FIELD_LABEL}
        helpText={HELP_TEXT}
        options={OPTIONS}
        value="a"
        onChange={vi.fn()}
      />,
    );

    expect(labelOf(screen.getByRole('combobox', { name: /Tipo/ }))).not.toContainElement(
      helpTrigger(),
    );
    // O MUI repete o rótulo dentro da `legend` que mede o entalhe do contorno.
    expect(document.querySelectorAll(`[aria-label="${HELP_TRIGGER}"]`)).toHaveLength(1);

    fireEvent.click(helpTrigger());

    expect(await screen.findByRole('tooltip')).toHaveTextContent(HELP_TEXT);
  });
});

describe('Input.Date', () => {
  it('should not offer a day after the max date', async () => {
    const pickedDay = new Date(2026, 7, 10);
    render(<Input.Date label="Data" value="10/08/2026" maxDate={pickedDay} onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: DATE_PICKER_LABEL }));

    const calendar = within(await screen.findByRole('grid'));
    expect(calendar.getByRole('gridcell', { name: '10' })).toBeEnabled();
    expect(calendar.getByRole('gridcell', { name: '11' })).toBeDisabled();
  });

  it('should close the calendar once the day is picked, which is all it asks for', async () => {
    render(<Input.Date label="Data" value="10/08/2026" onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: DATE_PICKER_LABEL }));

    await userEvent.click(
      within(await screen.findByRole('grid')).getByRole('gridcell', { name: '11' }),
    );

    await waitFor(() => expect(screen.queryByRole('grid')).not.toBeInTheDocument());
  });
});

const DEPARTURE = '22/05/2026 18:30';
const DEPARTURE_HOUR = '18:30';
/** Dia antes do mês: o adaptador crava a ordem inversa em qualquer idioma. */
const DEPARTURE_SHORT_DATE = '22 mai';
const DEPARTURE_YEAR = '2026';
/** Vem do idioma da biblioteca, não das nossas constantes. */
const PICKER_TITLE = 'Selecione data e hora';

function DateTimeHarness() {
  const [departure, setDeparture] = useState('');

  return <Input.DateTime label="Data e hora" value={departure} onChange={setDeparture} />;
}

const openDateTimePicker = () =>
  userEvent.click(screen.getByRole('button', { name: DATE_TIME_PICKER_LABEL }));

describe('Input.DateTime', () => {
  it('should offer the day and the hour behind one tab each, not both at once', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);

    await openDateTimePicker();

    expect(await screen.findByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should reach the hour through the other tab', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);
    await openDateTimePicker();
    const [, hourTab] = await screen.findAllByRole('tab');

    await userEvent.click(hourTab as HTMLElement);

    expect(await screen.findAllByRole('listbox')).not.toHaveLength(0);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('should show what was picked so far, since the panel covers the field', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);

    await openDateTimePicker();

    // O topo do painel parte o valor em botões, um por trecho editável.
    const top = (await screen.findByText(PICKER_TITLE)).parentElement;

    expect(top).toHaveTextContent(DEPARTURE_SHORT_DATE);
    expect(top).toHaveTextContent(DEPARTURE_HOUR);
  });

  it('should keep the hour already typed when the day changes', async () => {
    const onChange = vi.fn();
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={onChange} />);
    await openDateTimePicker();

    await userEvent.click(
      within(await screen.findByRole('grid')).getByRole('gridcell', { name: '23' }),
    );

    expect(onChange).toHaveBeenCalledWith('23/05/2026 18:30');
  });

  it('should go straight to the hour once the day is picked, panel still open', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);
    await openDateTimePicker();

    await userEvent.click(
      within(await screen.findByRole('grid')).getByRole('gridcell', { name: '23' }),
    );

    expect(await screen.findAllByRole('listbox')).not.toHaveLength(0);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  // O painel não traz botão nenhum: os da biblioteca não funcionam num painel
  // que não é dono do próprio ciclo. Quem fecha é escolher o minuto.
  it('should close itself once the minute is picked, and offer no button', async () => {
    render(<DateTimeHarness />);
    const field = screen.getByRole('textbox', { name: /Data e hora/ });
    await userEvent.type(field, '22052026');
    await openDateTimePicker();
    // Escolher o dia é o que leva à hora — o painel não tem botão de avançar.
    await userEvent.click(
      within(await screen.findByRole('grid')).getByRole('gridcell', { name: '23' }),
    );
    // O nome acessível da opção traz a unidade junto (`18 horas`); o texto, não.
    const [hours, minutes] = await screen.findAllByRole('listbox');
    await userEvent.click(within(hours as HTMLElement).getByText('18'));

    await userEvent.click(within(minutes as HTMLElement).getByText('30'));

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(field).toHaveValue('23/05/2026 18:30');
  });

  // O caminho de quem edita: a hora já está certa e só o minuto muda. Aqui não
  // há troca de vista nenhuma — as duas colunas ficam na tela ao mesmo tempo.
  it('should close when only the minute changes, without the day being touched', async () => {
    render(<DateTimeHarness />);
    const field = screen.getByRole('textbox', { name: /Data e hora/ });
    await userEvent.type(field, '220520261830');
    await openDateTimePicker();
    const [, hourTab] = await screen.findAllByRole('tab');
    await userEvent.click(hourTab as HTMLElement);
    const [, minutes] = await screen.findAllByRole('listbox');

    await userEvent.click(within(minutes as HTMLElement).getByText('45'));

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(field).toHaveValue('22/05/2026 18:45');
  });

  it('should leave the year out of the panel top, since the calendar already shows it', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);

    await openDateTimePicker();

    const top = (await screen.findByText(PICKER_TITLE)).parentElement;
    expect(top).not.toHaveTextContent(DEPARTURE_YEAR);
  });

  it('should size the day and the hour at the top alike', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);
    await openDateTimePicker();

    const top = (await screen.findByText(PICKER_TITLE)).parentElement as HTMLElement;
    const [day, hour] = [...top.querySelectorAll('button')];

    expect(getComputedStyle(hour as HTMLElement).fontSize).toBe(
      getComputedStyle(day as HTMLElement).fontSize,
    );
  });

  // A sobrescrita vive no `styles.ts` do campo, porque a biblioteca desenha o
  // título sem gancho no tema — e ela some sem nada acusar.
  it('should draw the panel title in our own type, not in the library caps', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);

    await openDateTimePicker();

    expect(getComputedStyle(await screen.findByText(PICKER_TITLE)).textTransform).toBe('none');
  });

  it('should not offer a day before the min date', async () => {
    const minDay = new Date(2026, 4, 22);
    render(
      <Input.DateTime label="Data e hora" value={DEPARTURE} minDate={minDay} onChange={vi.fn()} />,
    );

    await openDateTimePicker();

    const calendar = within(await screen.findByRole('grid'));
    expect(calendar.getByRole('gridcell', { name: '22' })).toBeEnabled();
    expect(calendar.getByRole('gridcell', { name: '21' })).toBeDisabled();
  });

  it('should mask what is typed and stop at the minute', async () => {
    render(<DateTimeHarness />);

    const field = screen.getByRole('textbox', { name: /Data e hora/ });
    await userEvent.type(field, '22052026183099');

    expect(field).toHaveValue(DEPARTURE);
  });

  it('should leave the caret where the typing was, not at the end of the field', async () => {
    render(<DateTimeHarness />);
    const field: HTMLInputElement = screen.getByRole('textbox', { name: /Data e hora/ });
    await userEvent.type(field, '22052026');

    await userEvent.type(field, '9', { initialSelectionStart: 1, initialSelectionEnd: 1 });

    expect(field).toHaveValue('29/20/5202 6');
    expect(field.selectionStart).toBe(2);
  });
});

/**
 * A cor primária do tema claro **é** a cor de texto, então lá as duas coincidem
 * e nada distingue a sobrescrita da ausência dela. O defeito mora só no escuro,
 * onde a primária é a superfície do cromo e como texto fica em 4,11:1.
 */
describe('Input.DateTime in the dark theme', () => {
  beforeEach(() => {
    themeModeStorage.save('dark');
  });

  afterEach(() => {
    themeModeStorage.save('light');
  });

  it('should draw the panel text in the reading colour, not in the chrome one', async () => {
    render(<Input.DateTime label="Data e hora" value={DEPARTURE} onChange={vi.fn()} />);
    await openDateTimePicker();
    await screen.findByRole('grid');

    const [dayTab] = screen.getAllByRole('tab');
    const readingColour = getComputedStyle(document.body).color;

    const top = (await screen.findByText(PICKER_TITLE)).parentElement as HTMLElement;
    const [day] = [...top.querySelectorAll('button')];

    expect(getComputedStyle(dayTab as HTMLElement).color).toBe(readingColour);
    expect(getComputedStyle(day as HTMLElement).color).toBe(readingColour);
  });
});
