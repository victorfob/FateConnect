import type { SelectOption } from '@design-system';
import { AddIcon, SaveIcon } from '@design-system/icons';

import { LOST_ITEM_KIND_OPTIONS } from '@app/pages/LostAndFound/helpers/lostItemKind';

import type { LostItemFormMode } from '../@types';

export const LOST_ITEM_LIMITS = {
  minName: 3,
  maxName: 100,
  minPlace: 3,
  maxPlace: 100,
  maxDescription: 300,
  maxPhotoMegabytes: 5,
  bytesPerMegabyte: 1_048_576,
};

export const MAX_PHOTO_BYTES =
  LOST_ITEM_LIMITS.maxPhotoMegabytes * LOST_ITEM_LIMITS.bytesPerMegabyte;

export const ACCEPTED_PHOTO_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** Só filtra o seletor do sistema; quem valida o formato é o schema. */
export const PHOTO_ACCEPT_ATTRIBUTE = [...ACCEPTED_PHOTO_TYPES].join(',');

export const REGISTER_MODE: LostItemFormMode = {
  title: 'Cadastrar item',
  submitLabel: 'Cadastrar item',
  submitIcon: AddIcon,
  succeeded: 'Item cadastrado.',
  failed: 'Erro ao cadastrar o item. Tente novamente.',
};

export const EDIT_MODE: LostItemFormMode = {
  title: 'Editar item',
  submitLabel: 'Salvar alterações',
  submitIcon: SaveIcon,
  succeeded: 'Item atualizado.',
  failed: 'Erro ao atualizar o item. Tente novamente.',
};

export const LOST_ITEM_FORM_LABELS = {
  name: 'Nome do Item',
  kind: 'Tipo',
  place: 'Local',
  occurredOn: 'Data do Ocorrido',
  description: 'Descrição',
  photo: 'Foto',
};

export const LOST_ITEM_FORM_PLACEHOLDERS = {
  name: 'Insira o nome do item',
  place: 'Onde o item foi achado ou perdido',
  select: 'Selecione',
  description: 'Descreva o item com detalhes',
};

export const DESCRIPTION_ROWS = 3;

export const PHOTO_ACTIONS = {
  pick: 'Escolher foto',
  replace: 'Trocar foto',
  remove: 'Remover foto',
  previewAlt: 'Prévia da foto escolhida',
};

export const PHOTO_HINT = `JPG, PNG ou WebP, até ${LOST_ITEM_LIMITS.maxPhotoMegabytes} MB.`;

const EMPTY_CHOICE: SelectOption = { value: '', label: LOST_ITEM_FORM_PLACEHOLDERS.select };

export const LOST_ITEM_KIND_SELECT_OPTIONS: readonly SelectOption[] = [
  EMPTY_CHOICE,
  ...LOST_ITEM_KIND_OPTIONS,
];

export const LOST_ITEM_FORM_MESSAGES = {
  nameTooShort: `O nome deve ter ao menos ${LOST_ITEM_LIMITS.minName} caracteres`,
  nameTooLong: `O nome deve ter no máximo ${LOST_ITEM_LIMITS.maxName} caracteres`,
  kindRequired: 'Selecione o tipo',
  placeTooShort: `O local deve ter ao menos ${LOST_ITEM_LIMITS.minPlace} caracteres`,
  placeTooLong: `O local deve ter no máximo ${LOST_ITEM_LIMITS.maxPlace} caracteres`,
  occurredOnRequired: 'Informe a data do ocorrido',
  occurredOnInFuture: 'A data do ocorrido não pode ser futura',
  descriptionTooLong: `A descrição pode ter no máximo ${LOST_ITEM_LIMITS.maxDescription} caracteres`,
  photoFormatInvalid: 'A foto deve ser JPG, PNG ou WebP',
  photoTooLarge: `A foto deve ter no máximo ${LOST_ITEM_LIMITS.maxPhotoMegabytes} MB`,
};
