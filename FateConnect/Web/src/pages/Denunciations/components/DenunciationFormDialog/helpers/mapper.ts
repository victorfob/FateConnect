import type { DenunciationInput } from '@app/services/denunciations/types';

import type { DenunciationFormValues } from '../schema';

export function toDenunciationInput(values: DenunciationFormValues): DenunciationInput {
  return {
    category: values.category,
    description: values.description,
    isAnonymous: values.isAnonymous,
    image: values.photo,
  };
}
