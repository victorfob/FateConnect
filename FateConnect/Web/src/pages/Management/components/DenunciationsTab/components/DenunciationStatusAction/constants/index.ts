import type { SelectOption } from '@design-system';

import { SELECT_PLACEHOLDER } from '@app/constants/selectPlaceholder';

export const STATUS_SELECT_LABEL = 'Nova situação';

/** Nasce sem escolha: mover é ação deliberada, não o estado de partida. */
export const EMPTY_CHOICE: SelectOption = { value: '', label: SELECT_PLACEHOLDER };

/**
 * O título leva a ação e o botão fecha o ato: a régua do diálogo pede o nome da
 * ação uma vez só. Nenhuma transição volta atrás, e é isso que a confirmação
 * existe para avisar.
 */
export const STATUS_DIALOG = {
  titlePrefix: 'Mover para ',
  message: 'A mudança de situação não pode ser desfeita.',
  confirmLabel: 'Confirmar',
  dismissLabel: 'Cancelar',
};
