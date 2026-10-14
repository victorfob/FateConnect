import type { StatusTagTone } from '@design-system';

import { ReportStatusEnum } from './types';

/**
 * ⛔ `Descartada` cobre os dois caminhos que a API permite: recusa na triagem e
 * recusa depois da análise. `Improcedente` afirmaria mérito que o primeiro não
 * teve, e `Arquivada` é o estado reversível de achados e perdidos.
 */
const STATUS_LABEL: Readonly<Record<ReportStatusEnum, string>> = {
  [ReportStatusEnum.OPEN]: 'Aberta',
  [ReportStatusEnum.IN_REVIEW]: 'Em análise',
  [ReportStatusEnum.RESOLVED]: 'Resolvida',
  [ReportStatusEnum.DISMISSED]: 'Descartada',
};

/** O que vai para a URL: o rótulo sem acento, porque a barra de endereço se lê. */
const STATUS_SLUG: Readonly<Record<ReportStatusEnum, string>> = {
  [ReportStatusEnum.OPEN]: 'aberta',
  [ReportStatusEnum.IN_REVIEW]: 'em-analise',
  [ReportStatusEnum.RESOLVED]: 'resolvida',
  [ReportStatusEnum.DISMISSED]: 'descartada',
};

const STATUS_TONE: Readonly<Record<ReportStatusEnum, StatusTagTone>> = {
  [ReportStatusEnum.OPEN]: 'warning',
  [ReportStatusEnum.IN_REVIEW]: 'muted',
  [ReportStatusEnum.RESOLVED]: 'success',
  [ReportStatusEnum.DISMISSED]: 'danger',
};

/**
 * ⛔ Para onde a API deixa ir, a partir de cada situação. `Resolved` e
 * `Dismissed` são terminais, e `Open` não alcança `Resolved` sem passar pela
 * análise — oferecer um par fora daqui é a tela pedindo o 400.
 */
const STATUS_TRANSITIONS: Readonly<Record<ReportStatusEnum, readonly ReportStatusEnum[]>> = {
  [ReportStatusEnum.OPEN]: [ReportStatusEnum.IN_REVIEW, ReportStatusEnum.DISMISSED],
  [ReportStatusEnum.IN_REVIEW]: [ReportStatusEnum.RESOLVED, ReportStatusEnum.DISMISSED],
  [ReportStatusEnum.RESOLVED]: [],
  [ReportStatusEnum.DISMISSED]: [],
};

const STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(ReportStatusEnum));

const UNKNOWN_LABEL = '—';

export const REPORT_STATUS_OPTIONS: readonly {
  value: ReportStatusEnum;
  label: string;
}[] = Object.values(ReportStatusEnum).map((status) => ({
  value: status,
  label: STATUS_LABEL[status],
}));

export function isReportStatus(value: string): value is ReportStatusEnum {
  return STATUS_VALUES.has(value);
}

export function reportStatusSlug(value: ReportStatusEnum): string {
  return STATUS_SLUG[value];
}

/** Interpreta o que a URL escreve, que é o rótulo sem acento e em minúsculo. */
export function parseReportStatus(raw: string | null | undefined): ReportStatusEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(ReportStatusEnum).find((status) => STATUS_SLUG[status] === slug);

  return found ?? null;
}

/** A situação vem da API, então o tipo aceita a ausência dela. */
export function reportStatusLabel(value: string | null | undefined): string {
  if (!value) return UNKNOWN_LABEL;
  if (!isReportStatus(value)) return value.trim() || UNKNOWN_LABEL;

  return STATUS_LABEL[value];
}

/** Vazio quando a situação é terminal: aí a tela não oferece ação nenhuma. */
export function reportStatusTransitions(value: ReportStatusEnum): readonly ReportStatusEnum[] {
  return STATUS_TRANSITIONS[value];
}

/** O passo adiante, que a gestão oferece como botão; o descarte vai à parte. */
export function reportForwardStatus(value: ReportStatusEnum): ReportStatusEnum | null {
  const forward = reportStatusTransitions(value).find(
    (status) => status !== ReportStatusEnum.DISMISSED,
  );

  return forward ?? null;
}

export function reportCanBeDismissed(value: ReportStatusEnum): boolean {
  return reportStatusTransitions(value).includes(ReportStatusEnum.DISMISSED);
}

export function reportStatusTone(value: string | null | undefined): StatusTagTone {
  if (!value || !isReportStatus(value)) return 'neutral';

  return STATUS_TONE[value];
}
