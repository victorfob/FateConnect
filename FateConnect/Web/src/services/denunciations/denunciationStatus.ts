import type { StatusTagTone } from '@design-system';

import { DenunciationStatusEnum } from './types';

/**
 * ⛔ `Não acolhida` cobre os dois caminhos que a API permite até aqui: recusa na
 * triagem e recusa depois da análise. `Improcedente` afirmaria mérito que o
 * primeiro não teve.
 */
const STATUS_LABEL: Readonly<Record<DenunciationStatusEnum, string>> = {
  [DenunciationStatusEnum.OPEN]: 'Aberta',
  [DenunciationStatusEnum.IN_REVIEW]: 'Em análise',
  [DenunciationStatusEnum.RESOLVED]: 'Resolvida',
  [DenunciationStatusEnum.DISMISSED]: 'Não acolhida',
};

/** O que vai para a URL: o rótulo sem acento, porque a barra de endereço se lê. */
const STATUS_SLUG: Readonly<Record<DenunciationStatusEnum, string>> = {
  [DenunciationStatusEnum.OPEN]: 'aberta',
  [DenunciationStatusEnum.IN_REVIEW]: 'em-analise',
  [DenunciationStatusEnum.RESOLVED]: 'resolvida',
  [DenunciationStatusEnum.DISMISSED]: 'nao-acolhida',
};

const STATUS_TONE: Readonly<Record<DenunciationStatusEnum, StatusTagTone>> = {
  [DenunciationStatusEnum.OPEN]: 'warning',
  [DenunciationStatusEnum.IN_REVIEW]: 'neutral',
  [DenunciationStatusEnum.RESOLVED]: 'success',
  [DenunciationStatusEnum.DISMISSED]: 'danger',
};

/**
 * ⛔ Para onde a API deixa ir, a partir de cada situação. `Resolved` e
 * `Dismissed` são terminais, e `Open` não alcança `Resolved` sem passar pela
 * análise — oferecer um par fora daqui é a tela pedindo o 400.
 */
const STATUS_TRANSITIONS: Readonly<
  Record<DenunciationStatusEnum, readonly DenunciationStatusEnum[]>
> = {
  [DenunciationStatusEnum.OPEN]: [
    DenunciationStatusEnum.IN_REVIEW,
    DenunciationStatusEnum.DISMISSED,
  ],
  [DenunciationStatusEnum.IN_REVIEW]: [
    DenunciationStatusEnum.RESOLVED,
    DenunciationStatusEnum.DISMISSED,
  ],
  [DenunciationStatusEnum.RESOLVED]: [],
  [DenunciationStatusEnum.DISMISSED]: [],
};

const STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(DenunciationStatusEnum));

const UNKNOWN_LABEL = '—';

export const DENUNCIATION_STATUS_OPTIONS: readonly {
  value: DenunciationStatusEnum;
  label: string;
}[] = Object.values(DenunciationStatusEnum).map((status) => ({
  value: status,
  label: STATUS_LABEL[status],
}));

export function isDenunciationStatus(value: string): value is DenunciationStatusEnum {
  return STATUS_VALUES.has(value);
}

export function denunciationStatusSlug(value: DenunciationStatusEnum): string {
  return STATUS_SLUG[value];
}

/** Interpreta o que a URL escreve, que é o rótulo sem acento e em minúsculo. */
export function parseDenunciationStatus(
  raw: string | null | undefined,
): DenunciationStatusEnum | null {
  if (!raw) return null;

  const slug = raw.trim().toLowerCase();
  const found = Object.values(DenunciationStatusEnum).find(
    (status) => STATUS_SLUG[status] === slug,
  );

  return found ?? null;
}

/** A situação vem da API, então o tipo aceita a ausência dela. */
export function denunciationStatusLabel(value: string | null | undefined): string {
  if (!value) return UNKNOWN_LABEL;
  if (!isDenunciationStatus(value)) return value.trim() || UNKNOWN_LABEL;

  return STATUS_LABEL[value];
}

/** Vazio quando a situação é terminal: aí a tela não oferece ação nenhuma. */
export function denunciationStatusTransitions(
  value: DenunciationStatusEnum,
): readonly DenunciationStatusEnum[] {
  return STATUS_TRANSITIONS[value];
}

export function denunciationStatusTone(value: string | null | undefined): StatusTagTone {
  if (!value || !isDenunciationStatus(value)) return 'neutral';

  return STATUS_TONE[value];
}
