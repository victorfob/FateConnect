import { DenunciationCategoryEnum } from '@app/services/denunciations/types';

import { DENUNCIATION_CATEGORY_OPTIONS, isDenunciationCategory } from './denunciationCategory';

/** Quantas o `EnumDenunciationCategory` declara hoje. */
const CATEGORY_COUNT = 9;

describe('denunciationCategory', () => {
  it('should offer one option per category, each labelled in pt-BR', () => {
    const labelled = DENUNCIATION_CATEGORY_OPTIONS.filter(
      (option) => option.label !== option.value,
    );

    expect(DENUNCIATION_CATEGORY_OPTIONS).toHaveLength(CATEGORY_COUNT);
    expect(labelled).toHaveLength(CATEGORY_COUNT);
  });

  it('should narrow what the API serializes and refuse the rest', () => {
    expect(isDenunciationCategory(DenunciationCategoryEnum.SPAM)).toBe(true);
    expect(isDenunciationCategory('')).toBe(false);
    expect(isDenunciationCategory('Harassment')).toBe(false);
  });
});
