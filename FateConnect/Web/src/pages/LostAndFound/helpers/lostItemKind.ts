import { LostItemKindEnum } from '@app/services/lostAndFound/types';
import type { StatusTagTone } from '@design-system';

/** Tipo é categoria, não estado: a cor do cartão fica inteira para a situação. */
export const LOST_ITEM_KIND_TONE: StatusTagTone = 'muted';

/** Uma fonte só, servindo o filtro e o cadastro; o valor canônico já é o rótulo. */
export const LOST_ITEM_KIND_OPTIONS: readonly { value: LostItemKindEnum; label: string }[] = [
  { value: LostItemKindEnum.FOUND, label: LostItemKindEnum.FOUND },
  { value: LostItemKindEnum.LOST, label: LostItemKindEnum.LOST },
];
