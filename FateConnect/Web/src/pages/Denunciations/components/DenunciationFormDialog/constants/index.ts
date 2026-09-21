import type { SelectOption } from '@design-system';

import type { PhotoFieldLabels } from '@app/components/PhotoField';
import { SELECT_PLACEHOLDER } from '@app/constants/selectPlaceholder';
import { DENUNCIATION_CATEGORY_OPTIONS } from '@app/pages/Denunciations/helpers/denunciationCategory';

/** Limites do `CreateDenunciationDto` e da entidade `Denunciation`, espelhados no front. */
export const DENUNCIATION_LIMITS = {
  minDescription: 10,
  maxDescription: 500,
  maxPhotoMegabytes: 5,
  bytesPerMegabyte: 1_048_576,
};

export const MAX_PHOTO_BYTES =
  DENUNCIATION_LIMITS.maxPhotoMegabytes * DENUNCIATION_LIMITS.bytesPerMegabyte;

export const ACCEPTED_PHOTO_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** Só filtra o seletor do sistema; quem valida o formato é o schema. */
export const PHOTO_ACCEPT_ATTRIBUTE = [...ACCEPTED_PHOTO_TYPES].join(',');

export const DENUNCIATION_FORM = {
  title: 'Enviar denúncia',
  submitLabel: 'Enviar denúncia',
  succeeded: 'Denúncia enviada.',
  failed: 'Erro ao enviar a denúncia. Tente novamente.',
};

/**
 * Responde a dúvida de quem está com o diálogo aberto — se o caso vale aqui — e
 * garante que nada é automático. ⛔ As medidas possíveis ficam de fora: elas já
 * estão no §8 dos termos, e no momento de denunciar elas pesam em vez de informar.
 */
export const CHANNEL_NOTE =
  'Vale para condutas que desrespeitam as regras da plataforma, dentro ou fora dela. Cada denúncia é analisada antes de qualquer medida.';

export const DENUNCIATION_FORM_LABELS = {
  confidential: 'Sigilosa',
  category: 'Motivo',
  description: 'Descrição',
  photo: 'Foto',
};

/**
 * Sigilo não é anonimato: a identidade existe e o que a esconde é o controle de
 * acesso. O motivo do vínculo entra junto, porque limite sem porquê se lê como
 * arbitrário. ⛔ O campo do contrato continua `isAnonymous`, que é como a API o
 * nomeia.
 */
export const CONFIDENTIAL_HINT =
  'A denúncia continua ligada à sua conta, o que permite apurar uso indevido do canal. Quem analisa não recebe os seus dados.';

export const DENUNCIATION_FORM_PLACEHOLDERS = {
  description: 'Conte o que aconteceu, com data e local',
};

export const DESCRIPTION_ROWS = 4;

export const PHOTO_FIELD_LABELS: PhotoFieldLabels = {
  field: DENUNCIATION_FORM_LABELS.photo,
  hint: `JPG, PNG ou WebP, até ${DENUNCIATION_LIMITS.maxPhotoMegabytes} MB.`,
  pick: 'Escolher foto',
  replace: 'Trocar foto',
  remove: 'Remover foto',
  previewAlt: 'Prévia da foto escolhida',
};

const EMPTY_CHOICE: SelectOption = { value: '', label: SELECT_PLACEHOLDER };

/** As escolhas do campo, já com a opção vazia na frente. */
export const DENUNCIATION_CATEGORY_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...DENUNCIATION_CATEGORY_OPTIONS,
];

export const DENUNCIATION_FORM_MESSAGES = {
  categoryRequired: 'Selecione o motivo',
  descriptionTooShort: `A descrição deve ter ao menos ${DENUNCIATION_LIMITS.minDescription} caracteres`,
  descriptionTooLong: `A descrição pode ter no máximo ${DENUNCIATION_LIMITS.maxDescription} caracteres`,
  photoFormatInvalid: 'A foto deve ser JPG, PNG ou WebP',
  photoTooLarge: `A foto deve ter no máximo ${DENUNCIATION_LIMITS.maxPhotoMegabytes} MB`,
};
