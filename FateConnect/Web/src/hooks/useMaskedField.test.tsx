import { useForm } from 'react-hook-form';

import { render, screen, userEvent } from '@app/test/testing-library';
import { maskPhone } from '@app/utils/masks/phoneMask';

import { useMaskedField } from './useMaskedField';

const FIELD_LABEL = 'Telefone';

function MaskedPhoneForm() {
  const { register } = useForm<{ phone: string }>({ defaultValues: { phone: '' } });
  const phoneField = useMaskedField(register('phone'), maskPhone);

  return (
    <label>
      {FIELD_LABEL}
      <input type="text" {...phoneField} />
    </label>
  );
}

function renderForm(): HTMLInputElement {
  render(<MaskedPhoneForm />);

  return screen.getByLabelText(FIELD_LABEL);
}

describe('useMaskedField', () => {
  it('should format the digits as they are typed', async () => {
    const input = renderForm();

    await userEvent.type(input, '11912345678');

    expect(input).toHaveValue('(11) 91234-5678');
  });

  it('should keep the caret next to the digit just typed in the middle of the value', async () => {
    const input = renderForm();
    await userEvent.type(input, '1123456789');

    await userEvent.type(input, '3', { initialSelectionStart: 1, initialSelectionEnd: 1 });

    // "31123456789" reformatado vira "(31) 12345-6789"; o "3" digitado continua sob o cursor.
    expect(input).toHaveValue('(31) 12345-6789');
    expect(input.selectionStart).toBe(2);
  });

  it('should keep the caret at the start when every digit before it was removed', async () => {
    const input = renderForm();
    await userEvent.type(input, '1123456789');

    await userEvent.type(input, '{Backspace}', {
      initialSelectionStart: 2,
      initialSelectionEnd: 2,
    });

    expect(input).toHaveValue('(12) 3456-789');
    expect(input.selectionStart).toBe(0);
  });

  it('should stop at the maximum length the mask allows', async () => {
    const input = renderForm();

    await userEvent.type(input, '119123456789');

    expect(input).toHaveValue('(11) 91234-5678');
  });
});
