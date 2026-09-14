import { DenunciationCategoryEnum } from '@app/services/denunciations/types';

/**
 * A denúncia não guarda referência ao que foi denunciado, então o motivo é a
 * única coisa que diz de qual contexto ela fala: o rótulo o carrega.
 */
const CATEGORY_LABEL: Readonly<Record<DenunciationCategoryEnum, string>> = {
  [DenunciationCategoryEnum.INAPPROPRIATE_BEHAVIOR]: 'Assédio, bullying ou discriminação',
  [DenunciationCategoryEnum.FAKE_PROFILE]: 'Perfil falso',
  [DenunciationCategoryEnum.SPAM]: 'Spam ou propaganda',
  [DenunciationCategoryEnum.RECKLESS_DRIVING]: 'Direção imprudente na carona',
  [DenunciationCategoryEnum.NO_SHOW]: 'Ausência sem aviso na carona',
  [DenunciationCategoryEnum.IMPROPER_CHARGING]: 'Cobrança indevida na carona',
  [DenunciationCategoryEnum.FRAUDULENT_CLAIM]: 'Pedido de item que não é da pessoa',
  [DenunciationCategoryEnum.FAKE_ITEM_POSTING]: 'Cadastro falso de item',
  [DenunciationCategoryEnum.OTHER]: 'Outro motivo',
};

const CATEGORY_VALUES: ReadonlySet<string> = new Set(Object.values(DenunciationCategoryEnum));

/** As escolhas do campo, na ordem do enum: geral, caronas, achados e perdidos. */
export const DENUNCIATION_CATEGORY_OPTIONS: readonly {
  value: DenunciationCategoryEnum;
  label: string;
}[] = Object.values(DenunciationCategoryEnum).map((category) => ({
  value: category,
  label: CATEGORY_LABEL[category],
}));

/**
 * Estreita o texto que o formulário guarda para o motivo da API. Usado como
 * validação do campo: o zod adota o tipo estreitado na saída do schema.
 */
export function isDenunciationCategory(value: string): value is DenunciationCategoryEnum {
  return CATEGORY_VALUES.has(value);
}
