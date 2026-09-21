import { DenunciationCategoryEnum } from '@app/services/denunciations/types';

import {
  DENUNCIATION_CATEGORY_OPTIONS,
  denunciationCategorySlug,
  isDenunciationCategory,
  parseDenunciationCategory,
} from './denunciationCategory';

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

describe('denunciationCategorySlug e parseDenunciationCategory', () => {
  it.each(Object.values(DenunciationCategoryEnum))(
    'should survive the round trip for %s',
    (category) => {
      expect(parseDenunciationCategory(denunciationCategorySlug(category))).toBe(category);
    },
  );

  it('should read the slug regardless of case', () => {
    expect(parseDenunciationCategory('  PERFIL-FALSO ')).toBe(
      DenunciationCategoryEnum.FAKE_PROFILE,
    );
  });

  it.each([null, undefined, '', 'inventado'])('should refuse %s', (raw) => {
    expect(parseDenunciationCategory(raw)).toBeNull();
  });
});
