import { LOST_ITEM_KIND_OPTIONS } from '@app/pages/LostAndFound/helpers/lostItemKind';
import type { SelectOption } from '@design-system';
import { AddIcon, SaveIcon } from '@design-system/icons';

import type { LostItemFormMode } from '../@types';

/** Limites do contrato do módulo, espelhados no front. */
export const LOST_ITEM_LIMITS = {
  minName: 3,
  maxName: 100,
  minPlace: 3,
  maxPlace: 100,
  maxDescription: 300,
  maxPhotoMegabytes: 5,
  /** `File.size` vem em bytes, e o limite de produto é falado em megabytes. */
  bytesPerMegabyte: 1_048_576,
};

export const MAX_PHOTO_BYTES =
  LOST_ITEM_LIMITS.maxPhotoMegabytes * LOST_ITEM_LIMITS.bytesPerMegabyte;

/** A mesma regra que o servidor vai repetir quando a #106 guardar o arquivo. */
export const ACCEPTED_PHOTO_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

/** O que o seletor do sistema oferece; o schema não confia nisso. */
export const PHOTO_ACCEPT_ATTRIBUTE = [...ACCEPTED_PHOTO_TYPES].join(',');

export const REGISTER_MODE: LostItemFormMode = {
  title: 'Cadastrar Item',
  submitLabel: 'Cadastrar Item',
  submitIcon: AddIcon,
  succeeded: 'Item cadastrado com sucesso.',
  failed: 'Erro ao cadastrar o item. Tente novamente.',
};

export const EDIT_MODE: LostItemFormMode = {
  title: 'Editar Item',
  submitLabel: 'Salvar Alterações',
  submitIcon: SaveIcon,
  succeeded: 'Item atualizado com sucesso.',
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
  name: 'Digite o nome do item',
  place: 'Onde o item foi achado ou perdido',
  select: 'Selecione',
  description: 'Descreva o item com detalhes',
};

export const DESCRIPTION_ROWS = 3;

export const PHOTO_ACTIONS = {
  pick: 'Escolher Foto',
  replace: 'Trocar Foto',
  remove: 'Remover Foto',
  previewAlt: 'Prévia da foto escolhida',
};

export const PHOTO_HINT = `JPG, PNG ou WebP, até ${LOST_ITEM_LIMITS.maxPhotoMegabytes} MB.`;

const EMPTY_CHOICE: SelectOption = { value: '', label: LOST_ITEM_FORM_PLACEHOLDERS.select };

/** As escolhas do campo, já com a opção vazia na frente. */
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
