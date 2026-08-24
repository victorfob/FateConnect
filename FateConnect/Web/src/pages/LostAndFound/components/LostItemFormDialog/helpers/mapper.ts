import type { LostItem, LostItemInput } from '@app/services/lostAndFound/types';

import { EMPTY_LOST_ITEM_FORM, type LostItemFormInput, type LostItemFormValues } from '../schema';

/** `aaaa-mm-dd` do contrato; o resto do carimbo, quando vier, não serve ao campo. */
const DATE_LENGTH = 10;

/** Sem item é cadastro, e o formulário abre vazio. */
export function toFormValues(item: LostItem | undefined): LostItemFormInput {
  if (!item) return EMPTY_LOST_ITEM_FORM;

  return {
    name: item.nome,
    kind: item.tipo,
    place: item.local,
    occurredOn: item.dataOcorrido.slice(0, DATE_LENGTH),
    description: item.descricao ?? '',
    // A foto guardada é uma URL, e o campo só sabe lidar com arquivo escolhido
    // agora: editar começa sem foto e só troca quem escolher outra.
    photo: null,
  };
}

/** O schema já entregou os campos aparados e o tipo estreitado. */
export function toLostItemInput(values: LostItemFormValues): LostItemInput {
  return {
    nome: values.name,
    tipo: values.kind,
    local: values.place,
    dataOcorrido: values.occurredOn,
    descricao: values.description,
  };
}
