import type { LostItem, LostItemInput } from '@app/services/lostAndFound/types';
import { toApiDateText, toDisplayDate } from '@app/utils/apiDate';

import { EMPTY_LOST_ITEM_FORM, type LostItemFormInput, type LostItemFormValues } from '../schema';

export function toFormValues(item: LostItem | undefined): LostItemFormInput {
  if (!item) return EMPTY_LOST_ITEM_FORM;

  return {
    name: item.name,
    kind: item.type,
    place: item.place,
    occurredOn: toDisplayDate(item.occurredOn),
    description: item.description ?? '',
    // O campo só lida com arquivo escolhido agora, não com a URL guardada.
    photo: null,
  };
}

export function toLostItemInput(values: LostItemFormValues): LostItemInput {
  return {
    name: values.name,
    type: values.kind,
    place: values.place,
    occurredOn: toApiDateText(values.occurredOn),
    description: values.description,
  };
}
