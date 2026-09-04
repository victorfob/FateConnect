import {
  LostItemKindEnum,
  LostItemStatusEnum,
  type LostItem,
} from '@app/services/lostAndFound/types';

import { EMPTY_LOST_ITEM_FORM, type LostItemFormValues } from '../schema';
import { toFormValues, toLostItemInput } from './mapper';

const LOST_ITEM: LostItem = {
  id: 'c4a1f0d2-5b3e-4a6c-9f81-7d2e5b0a3c14',
  name: 'Carteira preta',
  type: LostItemKindEnum.LOST,
  place: 'Biblioteca',
  occurredOn: '2026-08-11T00:00:00',
  description: 'Carteira de couro preta.',
  photoUrl: 'https://fotos.fateconnect.test/carteira.png',
  status: LostItemStatusEnum.OPEN,
  deletionReason: null,
  isMine: true,
  createdAt: '2026-08-12T00:00:00',
};

describe('toFormValues', () => {
  it('should open empty when there is no item to edit', () => {
    expect(toFormValues(undefined)).toEqual(EMPTY_LOST_ITEM_FORM);
  });

  it('should cut the api date down to what the field accepts', () => {
    const values = toFormValues(LOST_ITEM);

    expect(values.occurredOn).toBe('11/08/2026');
    expect(values.name).toBe('Carteira preta');
    expect(values.place).toBe('Biblioteca');
    expect(values.kind).toBe(LostItemKindEnum.LOST);
  });

  it('should start without a file even when the item already has a stored photo', () => {
    expect(toFormValues(LOST_ITEM).photo).toBeNull();
  });

  it('should turn a missing description into an empty field', () => {
    expect(toFormValues({ ...LOST_ITEM, description: null }).description).toBe('');
  });
});

describe('toLostItemInput', () => {
  it('should carry every field the api owns and leave the photo out', () => {
    const values: LostItemFormValues = {
      name: 'Carteira preta',
      kind: LostItemKindEnum.LOST,
      place: 'Biblioteca',
      occurredOn: '11/08/2026',
      description: 'Carteira de couro preta.',
      photo: new File(['foto'], 'carteira.png', { type: 'image/png' }),
    };

    expect(toLostItemInput(values)).toEqual({
      name: 'Carteira preta',
      type: LostItemKindEnum.LOST,
      place: 'Biblioteca',
      occurredOn: '2026-08-11',
      description: 'Carteira de couro preta.',
    });
  });
});
