import type { SelectOption } from '@design-system';

import { SELECT_PLACEHOLDER } from '@app/constants/selectPlaceholder';

import { REMOVAL_REASON_OPTIONS } from '../helpers';

export const REMOVAL_DIALOG = {
  trigger: 'Excluir',
  title: 'Confirmar exclusão',
  reasonLabel: 'Motivo',
  dismissLabel: 'Cancelar',
  confirmLabel: 'Excluir',
  reasonRequired: 'Selecione o motivo',
};

const EMPTY_CHOICE: SelectOption = { value: '', label: SELECT_PLACEHOLDER };

export const REASON_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...REMOVAL_REASON_OPTIONS,
];
