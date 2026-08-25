import { createRef } from 'react';

import { act, render, screen, userEvent, within } from '@app/test/testing-library';

import { TIME_PICKER_LABEL } from './constants';
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

describe('Input.HelpLabel', () => {
  it('should explain the field through a hint next to the label', () => {
    render(<Input label={<Input.HelpLabel helpText="Como escolher">Tipo</Input.HelpLabel>} />);

    const field = screen.getByRole('textbox', { name: /Tipo/ });

    expect(field).toBeInTheDocument();
    expect(labelOf(field)?.querySelector('svg')).toBeInTheDocument();
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

  it('should not offer a day after the max date', async () => {
    const pickedDay = new Date(2026, 7, 10);
    render(<Input.Date label="Data" value={pickedDay} maxDate={pickedDay} onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Escolha uma data/i }));

    const calendar = within(await screen.findByRole('grid'));
    expect(calendar.getByRole('gridcell', { name: '10' })).toBeEnabled();
    expect(calendar.getByRole('gridcell', { name: '11' })).toBeDisabled();
  });
});
