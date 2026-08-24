import { GenderValueEnum } from '@app/pages/Signup/@types';
import { SELECT_PLACEHOLDER } from '@app/pages/Signup/constants';
import type { SelectOption } from '@design-system';

export const PASSWORD_TOGGLE_LABEL = 'Mostrar ou ocultar senha';

export const GENDER_OPTIONS: readonly SelectOption[] = [
  { value: GenderValueEnum.MALE, label: 'Masculino' },
  { value: GenderValueEnum.FEMALE, label: 'Feminino' },
  { value: GenderValueEnum.OTHER, label: 'Prefiro não informar' },
];

/** As escolhas que o campo oferece, já com a opção vazia na frente. */
export const GENDER_SELECT_OPTIONS: readonly SelectOption[] = [
  { value: '', label: SELECT_PLACEHOLDER },
  ...GENDER_OPTIONS,
];
