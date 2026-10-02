import { useState } from 'react';

import { fireEvent, render, screen, userEvent } from '@app/test/testing-library';
import { HELP_TRIGGER_LABEL_PREFIX } from '@ds-root/components/Input/constants';

import { ADDRESS_OFF_AUTOCOMPLETE, HISTORY_OFF_AUTOCOMPLETE, SUGGESTION_LIMIT } from './constants';
import { AutocompleteField, type AutocompleteFieldProps } from '.';

const LABEL = 'Bairro';
const HELP_TEXT = 'Serve para notificar';
const OPTIONS = ['Centro, Sorocaba', 'Centro, Votorantim', 'Vila Hortência, Sorocaba'];
const OUTSIDE_THE_LIST = 'Chácara Recreio, Sorocaba';

type HarnessProps = Readonly<Omit<AutocompleteFieldProps, 'value' | 'onChange'>> & {
  onChange?: (value: string) => void;
};

function Harness({ onChange, ...props }: HarnessProps) {
  const [value, setValue] = useState('');

  const handleChange = (text: string) => {
    setValue(text);
    onChange?.(text);
  };

  return <AutocompleteField {...props} value={value} onChange={handleChange} />;
}

const DEFAULT_PROPS: HarnessProps = { label: LABEL, options: OPTIONS };

const renderComponent = (props = DEFAULT_PROPS) => render(<Harness {...props} />);

const field = () => screen.getByRole('combobox', { name: LABEL });

describe('AutocompleteField', () => {
  it('should suggest the options that match what is typed, ignoring case and accents', async () => {
    renderComponent();

    await userEvent.type(field(), 'HORTENCIA');

    expect(await screen.findByRole('option', { name: OPTIONS[2] })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('should match each typed word anywhere in the option, with no comma needed', async () => {
    renderComponent();

    await userEvent.type(field(), 'centro voto');

    expect(await screen.findByRole('option', { name: OPTIONS[1] })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('should suggest nothing before anything is typed', async () => {
    renderComponent();

    await userEvent.click(field());
    await userEvent.type(field(), 'centro');

    expect(await screen.findAllByRole('option')).toHaveLength(2);

    await userEvent.clear(field());

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should offer the empty-input suggestions as soon as the empty field gets the focus', async () => {
    renderComponent({ ...DEFAULT_PROPS, emptyInputSuggestions: [OUTSIDE_THE_LIST] });

    await userEvent.click(field());

    expect(await screen.findByRole('option', { name: OUTSIDE_THE_LIST })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('should offer the empty-input suggestions to whoever reaches the field by keyboard', async () => {
    renderComponent({ ...DEFAULT_PROPS, emptyInputSuggestions: [OUTSIDE_THE_LIST] });

    await userEvent.tab();

    expect(field()).toHaveFocus();
    expect(await screen.findByRole('option', { name: OUTSIDE_THE_LIST })).toBeInTheDocument();
  });

  it('should fill the field with the suggestion that is chosen', async () => {
    const onChange = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onChange });

    await userEvent.type(field(), 'votor');
    await userEvent.click(await screen.findByRole('option', { name: OPTIONS[1] }));

    expect(field()).toHaveValue(OPTIONS[1]);
    expect(onChange).toHaveBeenLastCalledWith(OPTIONS[1]);
  });

  it('should keep the text typed outside the list', async () => {
    const onChange = vi.fn();
    renderComponent({ ...DEFAULT_PROPS, onChange });

    await userEvent.type(field(), OUTSIDE_THE_LIST);
    await userEvent.tab();

    expect(field()).toHaveValue(OUTSIDE_THE_LIST);
    expect(onChange).toHaveBeenLastCalledWith(OUTSIDE_THE_LIST);
  });

  it('should hold the suggestions to the limit', async () => {
    const manyOptions = Array.from(
      { length: SUGGESTION_LIMIT + 1 },
      (_, index) => `Jardim ${index}, Sorocaba`,
    );
    renderComponent({ ...DEFAULT_PROPS, options: manyOptions });

    await userEvent.type(field(), 'jardim');

    expect(await screen.findAllByRole('option')).toHaveLength(SUGGESTION_LIMIT);
  });

  it('should keep the browser history of the field from opening over the suggestions', () => {
    renderComponent();

    expect(field()).toHaveAttribute('autocomplete', HISTORY_OFF_AUTOCOMPLETE);
  });

  it('should keep the saved addresses from opening over the suggestions of an address field', () => {
    renderComponent({ ...DEFAULT_PROPS, addressLike: true });

    expect(field()).toHaveAttribute('autocomplete', ADDRESS_OFF_AUTOCOMPLETE);
  });

  it('should turn the error message into the field helper text', () => {
    renderComponent({ ...DEFAULT_PROPS, error: 'Informe o bairro' });

    expect(screen.getByText('Informe o bairro')).toBeInTheDocument();
    expect(field()).toBeInvalid();
  });

  it('should carry the hint at the end of the field', async () => {
    renderComponent({ ...DEFAULT_PROPS, helpText: HELP_TEXT });

    fireEvent.click(screen.getByRole('button', { name: `${HELP_TRIGGER_LABEL_PREFIX} ${LABEL}` }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(HELP_TEXT);
  });
});
