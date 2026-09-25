import { format, parseISO } from 'date-fns';

import { denunciationCategoryLabel } from '@app/pages/Denunciations/helpers/denunciationCategory';
import type { Denunciation } from '@app/services/denunciations/types';

const FILE_DATE_FORMAT = 'dd-MM-yyyy';

export const DENUNCIATION_CARD_MARKERS = {
  confidential: 'Sigilosa',
};

export const DESCRIPTION_TOGGLE_LABELS = {
  expand: 'Expandir descrição',
  collapse: 'Recolher descrição',
};

export const DOWNLOAD_LABEL = 'Baixar a foto';

/** A data no nome diz o que um GUID não diria na pasta de downloads. */
export function photoBaseName({ createdAt }: Denunciation): string {
  return `denuncia-${format(parseISO(createdAt), FILE_DATE_FORMAT)}`;
}

export function photoAlt({ category }: Denunciation): string {
  return `Foto anexada à denúncia de ${denunciationCategoryLabel(category).toLowerCase()}`;
}
