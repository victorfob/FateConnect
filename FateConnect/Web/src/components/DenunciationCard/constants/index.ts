import { denunciationCategoryLabel } from '@app/pages/Denunciations/helpers/denunciationCategory';
import type { Denunciation } from '@app/services/denunciations/types';

export const DENUNCIATION_CARD_MARKERS = {
  confidential: 'Sigilosa',
};

export function photoAlt({ category }: Denunciation): string {
  return `Foto anexada à denúncia de ${denunciationCategoryLabel(category).toLowerCase()}`;
}
