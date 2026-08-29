import type { LostItem, LostItemInput } from '@app/services/lostAndFound/types';
import { firstCharacters } from '@app/utils/sequence';

import { EMPTY_LOST_ITEM_FORM, type LostItemFormInput, type LostItemFormValues } from '../schema';

const DATE_LENGTH = 10;

export function toFormValues(item: LostItem | undefined): LostItemFormInput {
  if (!item) return EMPTY_LOST_ITEM_FORM;

  return {
    name: item.nome,
    kind: item.tipo,
    place: item.local,
    occurredOn: firstCharacters(item.dataOcorrido, DATE_LENGTH),
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
    dataOcorrido: values.occurredOn,
    descricao: values.description,
  };
}
