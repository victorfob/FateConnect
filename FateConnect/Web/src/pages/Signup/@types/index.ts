/** Gênero como o formulário o carrega: o `select` trabalha com texto. */
export enum GenderValue {
  MALE = '0',
  FEMALE = '1',
  UNDISCLOSED = '2',
}

export type SelectOption = {
  readonly value: string;
  readonly label: string;
};
