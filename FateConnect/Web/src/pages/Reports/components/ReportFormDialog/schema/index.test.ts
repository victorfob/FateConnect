import { MAX_PHOTO_BYTES, PHOTO_MESSAGES } from '@app/components/PhotoField/constants';
import { ReportCategoryEnum } from '@app/services/reports/types';

import { REPORT_FORM_MESSAGES, REPORT_LIMITS } from '../constants';
import { reportFormSchema, type ReportFormInput } from '.';

const ONE_CHARACTER = 1;
const ONE_BYTE = 1;

const VALID: ReportFormInput = {
  category: ReportCategoryEnum.RECKLESS_DRIVING,
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

function firstErrorOf(overrides: Partial<ReportFormInput>): string | undefined {
  const result = reportFormSchema.safeParse({ ...VALID, ...overrides });
  if (result.success) return undefined;

  return result.error.issues[0]?.message;
}

describe('reportFormSchema', () => {
  it('should accept a filled form and narrow the category', () => {
    const result = reportFormSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    expect(result.data?.category).toBe(ReportCategoryEnum.RECKLESS_DRIVING);
  });

  it('should reject a category that was never chosen, and one the API does not serialize', () => {
    expect(firstErrorOf({ category: '' })).toBe(REPORT_FORM_MESSAGES.categoryRequired);
    expect(firstErrorOf({ category: 'Assédio' })).toBe(REPORT_FORM_MESSAGES.categoryRequired);
  });

  it('should reject a description shorter than the entity accepts', () => {
    const tooShort = 'a'.repeat(REPORT_LIMITS.minDescription - ONE_CHARACTER);

    expect(firstErrorOf({ description: tooShort })).toBe(REPORT_FORM_MESSAGES.descriptionTooShort);
  });

  it('should accept the description at both limits', () => {
    const shortest = 'a'.repeat(REPORT_LIMITS.minDescription);
    const longest = 'a'.repeat(REPORT_LIMITS.maxDescription);

    expect(firstErrorOf({ description: shortest })).toBeUndefined();
    expect(firstErrorOf({ description: longest })).toBeUndefined();
  });

  it('should reject a description longer than the column holds', () => {
    const tooLong = 'a'.repeat(REPORT_LIMITS.maxDescription + ONE_CHARACTER);

    expect(firstErrorOf({ description: tooLong })).toBe(REPORT_FORM_MESSAGES.descriptionTooLong);
  });

  /** O mínimo é contado depois do corte, como a entidade conta. */
  it('should trim the description before measuring it', () => {
    const paddedToTheMinimum = `  ${'a'.repeat(REPORT_LIMITS.minDescription)}  `;

    const result = reportFormSchema.safeParse({
      ...VALID,
      description: paddedToTheMinimum,
    });

    expect(result.data?.description).toBe('a'.repeat(REPORT_LIMITS.minDescription));
  });

  it('should leave the photo optional', () => {
    expect(firstErrorOf({ photo: null })).toBeUndefined();
    expect(firstErrorOf({ photo: photoOf('image/png', MAX_PHOTO_BYTES) })).toBeUndefined();
  });

  it('should reject a photo the API would refuse', () => {
    expect(firstErrorOf({ photo: photoOf('application/pdf', MAX_PHOTO_BYTES) })).toBe(
      PHOTO_MESSAGES.formatInvalid,
    );
    expect(firstErrorOf({ photo: photoOf('image/png', MAX_PHOTO_BYTES + ONE_BYTE) })).toBe(
      PHOTO_MESSAGES.tooLarge,
    );
  });
});
