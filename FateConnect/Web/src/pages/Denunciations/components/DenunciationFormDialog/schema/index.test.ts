import { DenunciationCategoryEnum } from '@app/services/denunciations/types';

import { DENUNCIATION_FORM_MESSAGES, DENUNCIATION_LIMITS, MAX_PHOTO_BYTES } from '../constants';
import { denunciationFormSchema, type DenunciationFormInput } from '.';

const ONE_CHARACTER = 1;
const ONE_BYTE = 1;

const VALID: DenunciationFormInput = {
  category: DenunciationCategoryEnum.RECKLESS_DRIVING,
  description: 'A pessoa dirigiu acima da velocidade no trajeto inteiro.',
  isAnonymous: false,
  photo: null,
};

/** O tamanho é declarado, não ocupado: alocar 5 MB só para reprovar é desperdício. */
function photoOf(type: string, sizeInBytes: number): File {
  const photo = new File(['conteúdo'], 'foto', { type });
  Object.defineProperty(photo, 'size', { value: sizeInBytes });

  return photo;
}

function firstErrorOf(overrides: Partial<DenunciationFormInput>): string | undefined {
  const result = denunciationFormSchema.safeParse({ ...VALID, ...overrides });
  if (result.success) return undefined;

  return result.error.issues[0]?.message;
}

describe('denunciationFormSchema', () => {
  it('should accept a filled form and narrow the category', () => {
    const result = denunciationFormSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    expect(result.data?.category).toBe(DenunciationCategoryEnum.RECKLESS_DRIVING);
  });

  it('should reject a category that was never chosen, and one the API does not serialize', () => {
    expect(firstErrorOf({ category: '' })).toBe(DENUNCIATION_FORM_MESSAGES.categoryRequired);
    expect(firstErrorOf({ category: 'Assédio' })).toBe(DENUNCIATION_FORM_MESSAGES.categoryRequired);
  });

  it('should reject a description shorter than the entity accepts', () => {
    const tooShort = 'a'.repeat(DENUNCIATION_LIMITS.minDescription - ONE_CHARACTER);

    expect(firstErrorOf({ description: tooShort })).toBe(
      DENUNCIATION_FORM_MESSAGES.descriptionTooShort,
    );
  });

  it('should accept the description at both limits', () => {
    const shortest = 'a'.repeat(DENUNCIATION_LIMITS.minDescription);
    const longest = 'a'.repeat(DENUNCIATION_LIMITS.maxDescription);

    expect(firstErrorOf({ description: shortest })).toBeUndefined();
    expect(firstErrorOf({ description: longest })).toBeUndefined();
  });

  it('should reject a description longer than the column holds', () => {
    const tooLong = 'a'.repeat(DENUNCIATION_LIMITS.maxDescription + ONE_CHARACTER);

    expect(firstErrorOf({ description: tooLong })).toBe(
      DENUNCIATION_FORM_MESSAGES.descriptionTooLong,
    );
  });

  /** O mínimo é contado depois do corte, como a entidade conta. */
  it('should trim the description before measuring it', () => {
    const paddedToTheMinimum = `  ${'a'.repeat(DENUNCIATION_LIMITS.minDescription)}  `;

    const result = denunciationFormSchema.safeParse({
      ...VALID,
      description: paddedToTheMinimum,
    });

    expect(result.data?.description).toBe('a'.repeat(DENUNCIATION_LIMITS.minDescription));
  });

  it('should leave the photo optional', () => {
    expect(firstErrorOf({ photo: null })).toBeUndefined();
    expect(firstErrorOf({ photo: photoOf('image/png', MAX_PHOTO_BYTES) })).toBeUndefined();
  });

  it('should reject a photo the API would refuse', () => {
    expect(firstErrorOf({ photo: photoOf('application/pdf', MAX_PHOTO_BYTES) })).toBe(
      DENUNCIATION_FORM_MESSAGES.photoFormatInvalid,
    );
    expect(firstErrorOf({ photo: photoOf('image/png', MAX_PHOTO_BYTES + ONE_BYTE) })).toBe(
      DENUNCIATION_FORM_MESSAGES.photoTooLarge,
    );
  });
});
