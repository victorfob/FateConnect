import { format, parseISO } from 'date-fns';

import { denunciationCategoryLabel } from '@app/pages/Denunciations/helpers/denunciationCategory';
import type { Denunciation } from '@app/services/denunciations/types';

const FILE_DATE_FORMAT = 'dd-MM-yyyy';
const DEFAULT_PHOTO_EXTENSION = 'png';

export const DENUNCIATIONS_QUERY_KEY = 'management-denunciations';

export const EMPTY_LIST_MESSAGE =
  'Nenhuma denúncia encontrada. As que a busca alcançar aparecem aqui, com o motivo e a situação de cada uma. Ajuste os filtros para ampliar a busca.';

export const DENUNCIATION_LIST_MESSAGES = {
  loadFailed: 'Erro ao carregar as denúncias. Tente novamente.',
  statusChanged: 'Situação atualizada.',
  statusFailed: 'Erro ao mudar a situação. Tente novamente.',
};

export const DOWNLOAD_LABEL = 'Baixar a foto';

/** A data no nome diz o que um GUID não diria na pasta de downloads. */
export function photoFileName({ createdAt, imageUrl }: Denunciation): string {
  const extension = imageUrl?.split('.').pop() ?? DEFAULT_PHOTO_EXTENSION;

  return `denuncia-${format(parseISO(createdAt), FILE_DATE_FORMAT)}.${extension}`;
}

export function photoAlt({ category }: Denunciation): string {
  return `Foto anexada à denúncia de ${denunciationCategoryLabel(category).toLowerCase()}`;
}
