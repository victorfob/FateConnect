import { ReportCategoryEnum } from '@app/services/reports/types';

/**
 * A denúncia não guarda referência ao que foi denunciado, então o motivo é a
 * única coisa que diz de qual contexto ela fala: o rótulo o carrega.
 */
const CATEGORY_LABEL: Readonly<Record<ReportCategoryEnum, string>> = {
  [ReportCategoryEnum.INAPPROPRIATE_BEHAVIOR]: 'Assédio, bullying ou discriminação',
  [ReportCategoryEnum.FAKE_PROFILE]: 'Perfil falso',
  [ReportCategoryEnum.SPAM]: 'Spam ou propaganda',
  [ReportCategoryEnum.RECKLESS_DRIVING]: 'Direção imprudente na carona',
  [ReportCategoryEnum.NO_SHOW]: 'Ausência sem aviso na carona',
  [ReportCategoryEnum.IMPROPER_CHARGING]: 'Cobrança indevida na carona',
  [ReportCategoryEnum.FRAUDULENT_CLAIM]: 'Pedido de item que não é da pessoa',
  [ReportCategoryEnum.FAKE_ITEM_POSTING]: 'Cadastro falso de item',
  [ReportCategoryEnum.OTHER]: 'Outro motivo',
};

/** O que vai para a URL: o rótulo encurtado, sem acento, porque o endereço se lê. */
const CATEGORY_SLUG: Readonly<Record<ReportCategoryEnum, string>> = {
  [ReportCategoryEnum.INAPPROPRIATE_BEHAVIOR]: 'assedio',
  [ReportCategoryEnum.FAKE_PROFILE]: 'perfil-falso',
  [ReportCategoryEnum.SPAM]: 'spam',
  [ReportCategoryEnum.RECKLESS_DRIVING]: 'direcao-imprudente',
  [ReportCategoryEnum.NO_SHOW]: 'ausencia',
  [ReportCategoryEnum.IMPROPER_CHARGING]: 'cobranca-indevida',
  [ReportCategoryEnum.FRAUDULENT_CLAIM]: 'pedido-indevido',
  [ReportCategoryEnum.FAKE_ITEM_POSTING]: 'cadastro-falso',
  [ReportCategoryEnum.OTHER]: 'outro',
};

const CATEGORY_VALUES: ReadonlySet<string> = new Set(Object.values(ReportCategoryEnum));

const UNKNOWN_LABEL = '—';

/** As escolhas do campo, na ordem do enum: geral, caronas, achados e perdidos. */
export const REPORT_CATEGORY_OPTIONS: readonly {
  value: ReportCategoryEnum;
  label: string;
}[] = Object.values(ReportCategoryEnum).map((category) => ({
  value: category,
  label: CATEGORY_LABEL[category],
}));

/**
 * Estreita o texto que o formulário guarda para o motivo da API. Usado como
 * validação do campo: o zod adota o tipo estreitado na saída do schema.
 */
export function isReportCategory(value: string): value is ReportCategoryEnum {
  return CATEGORY_VALUES.has(value);
}

/** O motivo vem da API, então o tipo aceita um valor que o produto não conhece. */
export function reportCategoryLabel(value: string): string {
  if (!isReportCategory(value)) return value.trim() || UNKNOWN_LABEL;

  return CATEGORY_LABEL[value];
}

export function reportCategorySlug(value: ReportCategoryEnum): string {
  return CATEGORY_SLUG[value];
}

/** Interpreta o que a URL escreve, que é o rótulo encurtado e sem acento. */
export function parseReportCategory(raw: string | null | undefined): ReportCategoryEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(ReportCategoryEnum).find(
    (category) => CATEGORY_SLUG[category] === slug,
  );

  return found ?? null;
}
