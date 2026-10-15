import type { SelectOption } from '@design-system';

import { RemovalReasonEnum } from '@app/services/moderation/types';

/** O mesmo nome vai na escolha e no aviso que a API grava para quem publicou. */
const REASON_LABEL: Readonly<Record<RemovalReasonEnum, string>> = {
  [RemovalReasonEnum.OFFENSIVE]: 'Conteúdo ofensivo ou discriminatório',
  [RemovalReasonEnum.MISLEADING]: 'Informação falsa ou enganosa',
  [RemovalReasonEnum.THIRD_PARTY_RIGHTS]: 'Violação de direito de outra pessoa',
  [RemovalReasonEnum.COMMERCIAL]: 'Finalidade comercial ou de publicidade',
  [RemovalReasonEnum.PERSONAL_DATA]: 'Exposição de dados de outra pessoa',
};

const REASON_VALUES: ReadonlySet<string> = new Set(Object.values(RemovalReasonEnum));

export const REMOVAL_REASON_OPTIONS: readonly SelectOption[] = Object.values(RemovalReasonEnum).map(
  (reason) => ({ value: reason, label: REASON_LABEL[reason] }),
);

export function isRemovalReason(value: string): value is RemovalReasonEnum {
  return REASON_VALUES.has(value);
}
