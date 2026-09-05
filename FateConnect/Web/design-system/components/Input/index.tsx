import { DateField } from './components/DateField';
import { DateTimeField } from './components/DateTimeField';
import { SelectInput } from './components/SelectInput';
import { InputField, type InputProps } from './InputField';

export type { InputProps };

/**
 * Campo do produto. O rótulo é uma string e quem o desenha é o MUI — é isso que
 * faz o texto parecer indicação de campo vazio, e não valor já digitado.
 */
function Input(inputProps: InputProps) {
  return <InputField {...inputProps} />;
}

Input.Date = DateField;
Input.DateTime = DateTimeField;
Input.Select = SelectInput;

export { Input };
