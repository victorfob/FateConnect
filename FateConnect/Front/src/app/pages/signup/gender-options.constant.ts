export type GenderValue = 0 | 1 | 2;

export const GENDER_OPTIONS: { readonly value: GenderValue; readonly label: string }[] = [
  { value: 0, label: 'Masculino' },
  { value: 1, label: 'Feminino' },
  { value: 2, label: 'Prefiro não informar' },
];
