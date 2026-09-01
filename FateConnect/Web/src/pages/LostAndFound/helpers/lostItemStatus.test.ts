import { LostItemStatusEnum } from '@app/services/lostAndFound/types';

import { lostItemStatusLabel, lostItemStatusTone } from './lostItemStatus';

describe('lostItemStatusLabel', () => {
  it('should accent the label the api sends without accent', () => {
    expect(lostItemStatusLabel(LostItemStatusEnum.RESOLVED)).toBe('Resolvido');
    expect(lostItemStatusLabel(LostItemStatusEnum.OPEN)).toBe('Aberto');
    expect(lostItemStatusLabel(LostItemStatusEnum.CANCELLED)).toBe('Cancelado');
  });

  it('should fall back to the raw value when the status is unknown', () => {
    expect(lostItemStatusLabel('Arquivado')).toBe('Arquivado');
    expect(lostItemStatusLabel('  ')).toBe('—');
  });

  it('should fall back to the unknown label when the api omits the status', () => {
    expect(lostItemStatusLabel(undefined)).toBe('—');
    expect(lostItemStatusLabel(null)).toBe('—');
  });
});

describe('lostItemStatusTone', () => {
  it('should give each situation its own colour', () => {
    expect(lostItemStatusTone(LostItemStatusEnum.OPEN)).toBe('warning');
    expect(lostItemStatusTone(LostItemStatusEnum.RESOLVED)).toBe('success');
    expect(lostItemStatusTone(LostItemStatusEnum.CANCELLED)).toBe('danger');
  });

  it('should leave the unknown status without a box', () => {
    expect(lostItemStatusTone('Arquivado')).toBe('neutral');
    expect(lostItemStatusTone(undefined)).toBe('neutral');
  });
});
