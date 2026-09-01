import type { LostItem, LostItemInput } from '@app/services/lostAndFound/types';
import { toApiDateText, toDisplayDate } from '@app/utils/apiDate';

import { EMPTY_LOST_ITEM_FORM, type LostItemFormInput, type LostItemFormValues } from '../schema';

export function toFormValues(item: LostItem | undefined): LostItemFormInput {
  if (!item) return EMPTY_LOST_ITEM_FORM;

  return {
    name: item.nome,
    kind: item.tipo,
    place: item.local,
    occurredOn: toDisplayDate(item.dataOcorrido),
    description: item.descricao ?? '',
    // O campo só lida com arquivo escolhido agora, não com a URL guardada.
    photo: null,
  };
}

export function toLostItemInput(values: LostItemFormValues): LostItemInput {
  return {
    nome: values.name,
    tipo: values.kind,
    local: values.place,
    dataOcorrido: toApiDateText(values.occurredOn),
    descricao: values.description,
  };
}
