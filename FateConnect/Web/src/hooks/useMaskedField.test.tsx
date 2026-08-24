import { useForm } from 'react-hook-form';

import { render, screen, userEvent } from '@app/test/testing-library';
import { maskBirthDate } from '@app/utils/masks/birthDateMask';

import { useMaskedField } from './useMaskedField';

const FIELD_LABEL = 'Data de nascimento';

function MaskedDateForm() {
  const { register } = useForm<{ birthDate: string }>({ defaultValues: { birthDate: '' } });
  const birthDateField = useMaskedField(register('birthDate'), maskBirthDate);

  return (
    <label>
      {FIELD_LABEL}
      <input type="text" {...birthDateField} />
    </label>
  );
}

function renderForm(): HTMLInputElement {
  render(<MaskedDateForm />);

  return screen.getByLabelText(FIELD_LABEL);
}

describe('useMaskedField', () => {
  it('should format the digits as they are typed', async () => {
    const input = renderForm();

    await userEvent.type(input, '22051999');

    expect(input).toHaveValue('22/05/1999');
  });

  it('should keep the caret next to the digit just typed in the middle of the value', async () => {
    const input = renderForm();
    await userEvent.type(input, '22051999');

    await userEvent.type(input, '3', { initialSelectionStart: 1, initialSelectionEnd: 1 });

    // "232051999" reformatado vira "23/20/5199"; o "3" digitado continua sob o cursor.
    expect(input).toHaveValue('23/20/5199');
    expect(input.selectionStart).toBe(2);
  });

  it('should keep the caret at the start when every digit before it was removed', async () => {
    const input = renderForm();
    await userEvent.type(input, '22051999');

    await userEvent.type(input, '{Backspace}', {
      initialSelectionStart: 1,
      initialSelectionEnd: 1,
    });

    expect(input).toHaveValue('20/51/999');
    expect(input.selectionStart).toBe(0);
  });

  it('should stop at the maximum length the mask allows', async () => {
    const input = renderForm();

    await userEvent.type(input, '2205199999');

    expect(input).toHaveValue('22/05/1999');
  });
});
