import { LostItemKindEnum } from '@app/services/lostAndFound/types';
import { toApiDate } from '@app/utils/apiDate';

import { LOST_ITEM_FORM_MESSAGES, LOST_ITEM_LIMITS, MAX_PHOTO_BYTES } from '../constants';
import { lostItemFormSchema, type LostItemFormInput } from '.';

const DAY_MS = 24 * 60 * 60 * 1000;

const VALID: LostItemFormInput = {
  name: 'Garrafa térmica',
  kind: LostItemKindEnum.FOUND,
  place: 'Biblioteca',
  occurredOn: toApiDate(new Date()),
  description: 'Garrafa azul, com adesivos na tampa.',
  photo: null,
};

/** O tamanho é declarado, não ocupado: alocar 5 MB só para reprovar é desperdício. */
function photoOf(type: string, sizeInBytes: number): File {
  const photo = new File(['conteúdo'], 'foto', { type });
  Object.defineProperty(photo, 'size', { value: sizeInBytes });

  return photo;
}

function firstErrorOf(overrides: Partial<LostItemFormInput>): string | undefined {
  const result = lostItemFormSchema.safeParse({ ...VALID, ...overrides });
  if (result.success) return undefined;

  return result.error.issues[0]?.message;
}

describe('lostItemFormSchema', () => {
  it('should accept a filled form and narrow the item kind', () => {
    const result = lostItemFormSchema.safeParse(VALID);

    expect(result.success).toBe(true);
    expect(result.data?.kind).toBe(LostItemKindEnum.FOUND);
  });

  it('should trim the name, the place and the description', () => {
    const result = lostItemFormSchema.safeParse({
      ...VALID,
      name: '  Garrafa térmica  ',
      place: '  Biblioteca  ',
      description: '  Garrafa azul.  ',
    });

    expect(result.data?.name).toBe('Garrafa térmica');
    expect(result.data?.place).toBe('Biblioteca');
    expect(result.data?.description).toBe('Garrafa azul.');
  });

  it('should hold the name to the length the api accepts', () => {
    expect(firstErrorOf({ name: 'ab' })).toBe(LOST_ITEM_FORM_MESSAGES.nameTooShort);
    expect(firstErrorOf({ name: 'a'.repeat(LOST_ITEM_LIMITS.minName) })).toBeUndefined();
    expect(firstErrorOf({ name: 'a'.repeat(LOST_ITEM_LIMITS.maxName) })).toBeUndefined();
    expect(firstErrorOf({ name: 'a'.repeat(LOST_ITEM_LIMITS.maxName + 1) })).toBe(
      LOST_ITEM_FORM_MESSAGES.nameTooLong,
    );
  });

  it('should hold the place to the length the api accepts', () => {
    expect(firstErrorOf({ place: 'ab' })).toBe(LOST_ITEM_FORM_MESSAGES.placeTooShort);
    expect(firstErrorOf({ place: 'a'.repeat(LOST_ITEM_LIMITS.minPlace) })).toBeUndefined();
    expect(firstErrorOf({ place: 'a'.repeat(LOST_ITEM_LIMITS.maxPlace) })).toBeUndefined();
    expect(firstErrorOf({ place: 'a'.repeat(LOST_ITEM_LIMITS.maxPlace + 1) })).toBe(
      LOST_ITEM_FORM_MESSAGES.placeTooLong,
    );
  });

  it('should require a kind from the api vocabulary', () => {
    expect(firstErrorOf({ kind: '' })).toBe(LOST_ITEM_FORM_MESSAGES.kindRequired);
    expect(firstErrorOf({ kind: 'Encontrado' })).toBe(LOST_ITEM_FORM_MESSAGES.kindRequired);
  });

  it('should require the date of the event', () => {
    expect(firstErrorOf({ occurredOn: '' })).toBe(LOST_ITEM_FORM_MESSAGES.occurredOnRequired);
  });

  it('should refuse a day that has not happened yet and accept today', () => {
    expect(firstErrorOf({ occurredOn: toApiDate(new Date(Date.now() + DAY_MS)) })).toBe(
      LOST_ITEM_FORM_MESSAGES.occurredOnInFuture,
    );
    expect(firstErrorOf({ occurredOn: toApiDate(new Date()) })).toBeUndefined();
    expect(firstErrorOf({ occurredOn: toApiDate(new Date(Date.now() - DAY_MS)) })).toBeUndefined();
  });

  it('should accept an empty description but cap a long one', () => {
    expect(firstErrorOf({ description: '' })).toBeUndefined();
    expect(
      firstErrorOf({ description: 'a'.repeat(LOST_ITEM_LIMITS.maxDescription) }),
    ).toBeUndefined();
    expect(firstErrorOf({ description: 'a'.repeat(LOST_ITEM_LIMITS.maxDescription + 1) })).toBe(
      LOST_ITEM_FORM_MESSAGES.descriptionTooLong,
    );
  });

  it('should treat the photo as optional', () => {
    expect(firstErrorOf({ photo: null })).toBeUndefined();
  });

  it('should accept only the image formats the server will accept', () => {
    expect(firstErrorOf({ photo: photoOf('image/jpeg', MAX_PHOTO_BYTES) })).toBeUndefined();
    expect(firstErrorOf({ photo: photoOf('image/png', MAX_PHOTO_BYTES) })).toBeUndefined();
    expect(firstErrorOf({ photo: photoOf('image/webp', MAX_PHOTO_BYTES) })).toBeUndefined();
    expect(firstErrorOf({ photo: photoOf('image/gif', MAX_PHOTO_BYTES) })).toBe(
      LOST_ITEM_FORM_MESSAGES.photoFormatInvalid,
    );
    expect(firstErrorOf({ photo: photoOf('application/pdf', MAX_PHOTO_BYTES) })).toBe(
      LOST_ITEM_FORM_MESSAGES.photoFormatInvalid,
    );
  });

  it('should refuse a photo heavier than the limit', () => {
    expect(firstErrorOf({ photo: photoOf('image/png', MAX_PHOTO_BYTES + 1) })).toBe(
      LOST_ITEM_FORM_MESSAGES.photoTooLarge,
    );
  });
});
