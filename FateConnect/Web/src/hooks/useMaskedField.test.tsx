import { useForm } from 'react-hook-form';

import { render, screen, userEvent } from '@app/test/testing-library';
import { maskZipCode } from '@app/utils/masks/zipCodeMask';

import { useMaskedField } from './useMaskedField';

const FIELD_LABEL = 'CEP';

function MaskedZipCodeForm() {
  const { register } = useForm<{ zipCode: string }>({ defaultValues: { zipCode: '' } });
  const zipCodeField = useMaskedField(register('zipCode'), maskZipCode);

  return (
    <label>
      {FIELD_LABEL}
      <input type="text" {...zipCodeField} />
    </label>
  );
}

function renderForm(): HTMLInputElement {
  render(<MaskedZipCodeForm />);

  return screen.getByLabelText(FIELD_LABEL);
}

describe('useMaskedField', () => {
  it('should format the digits as they are typed', async () => {
    const input = renderForm();

    await userEvent.type(input, '01001000');

    expect(input).toHaveValue('01001-000');
  });

  it('should keep the caret next to the digit just typed in the middle of the value', async () => {
    const input = renderForm();
    await userEvent.type(input, '01001000');

    await userEvent.type(input, '3', { initialSelectionStart: 1, initialSelectionEnd: 1 });

    // "031001000" reformatado vira "03100-100"; o "3" digitado continua sob o cursor.
    expect(input).toHaveValue('03100-100');
    expect(input.selectionStart).toBe(2);
  });

  it('should keep the caret at the start when every digit before it was removed', async () => {
    const input = renderForm();
    await userEvent.type(input, '01001000');

    await userEvent.type(input, '{Backspace}', {
      initialSelectionStart: 1,
      initialSelectionEnd: 1,
    });

    expect(input).toHaveValue('10010-00');
    expect(input.selectionStart).toBe(0);
  });

  it('should stop at the maximum length the mask allows', async () => {
    const input = renderForm();

    await userEvent.type(input, '010010009');

    expect(input).toHaveValue('01001-000');
  });
});
