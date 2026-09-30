const MAX_PHOTO_MEGABYTES = 5;
const BYTES_PER_MEGABYTE = 1_048_576;

/** O limite e os formatos que o `ValidImage` da API aceita, espelhados aqui. */
export const MAX_PHOTO_BYTES = MAX_PHOTO_MEGABYTES * BYTES_PER_MEGABYTE;

export const ACCEPTED_PHOTO_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** Só filtra o seletor do sistema; quem valida o formato é o schema. */
export const PHOTO_ACCEPT_ATTRIBUTE = [...ACCEPTED_PHOTO_TYPES].join(',');

export const PHOTO_FIELD_TEXTS = {
  hint: `JPG, PNG ou WebP, até ${MAX_PHOTO_MEGABYTES} MB.`,
  pick: 'Escolher foto',
  replace: 'Trocar foto',
  remove: 'Remover foto',
  previewAlt: 'Prévia da foto escolhida',
};

export const PHOTO_MESSAGES = {
  formatInvalid: 'A foto deve ser JPG, PNG ou WebP',
  tooLarge: `A foto deve ter no máximo ${MAX_PHOTO_MEGABYTES} MB`,
};
