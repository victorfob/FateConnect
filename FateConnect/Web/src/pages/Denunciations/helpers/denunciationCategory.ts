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

/** O que vai para a URL: o rótulo encurtado, sem acento, porque o endereço se lê. */
const CATEGORY_SLUG: Readonly<Record<DenunciationCategoryEnum, string>> = {
  [DenunciationCategoryEnum.INAPPROPRIATE_BEHAVIOR]: 'assedio',
  [DenunciationCategoryEnum.FAKE_PROFILE]: 'perfil-falso',
  [DenunciationCategoryEnum.SPAM]: 'spam',
  [DenunciationCategoryEnum.RECKLESS_DRIVING]: 'direcao-imprudente',
  [DenunciationCategoryEnum.NO_SHOW]: 'ausencia',
  [DenunciationCategoryEnum.IMPROPER_CHARGING]: 'cobranca-indevida',
  [DenunciationCategoryEnum.FRAUDULENT_CLAIM]: 'pedido-indevido',
  [DenunciationCategoryEnum.FAKE_ITEM_POSTING]: 'cadastro-falso',
  [DenunciationCategoryEnum.OTHER]: 'outro',
};

const CATEGORY_VALUES: ReadonlySet<string> = new Set(Object.values(DenunciationCategoryEnum));

const UNKNOWN_LABEL = '—';

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

/** O motivo vem da API, então o tipo aceita um valor que o produto não conhece. */
export function denunciationCategoryLabel(value: string): string {
  if (!isDenunciationCategory(value)) return value.trim() || UNKNOWN_LABEL;

  return CATEGORY_LABEL[value];
}

export function denunciationCategorySlug(value: DenunciationCategoryEnum): string {
  return CATEGORY_SLUG[value];
}

/** Interpreta o que a URL escreve, que é o rótulo encurtado e sem acento. */
export function parseDenunciationCategory(
  raw: string | null | undefined,
): DenunciationCategoryEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(DenunciationCategoryEnum).find(
    (category) => CATEGORY_SLUG[category] === slug,
  );

  return found ?? null;
}
