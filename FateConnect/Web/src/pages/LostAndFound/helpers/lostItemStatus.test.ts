import { LostItemStatusEnum } from '@app/services/lostAndFound/types';

import { lostItemStatusLabel, lostItemStatusTone } from './lostItemStatus';

describe('lostItemStatusLabel', () => {
  it('should accent the label the api sends without accent', () => {
    expect(lostItemStatusLabel(LostItemStatusEnum.RESOLVED)).toBe('Concluído');
    expect(lostItemStatusLabel(LostItemStatusEnum.OPEN)).toBe('Aberto');
    expect(lostItemStatusLabel(LostItemStatusEnum.CANCELLED)).toBe('Cancelado');
  });

  it('should fall back to the raw value when the status is unknown', () => {
    expect(lostItemStatusLabel('Arquivado')).toBe('Arquivado');
    expect(lostItemStatusLabel('  ')).toBe('—');
  });
});

describe('lostItemStatusTone', () => {
  it('should keep the open item grey and colour only what ended', () => {
    expect(lostItemStatusTone(LostItemStatusEnum.OPEN)).toBe('muted');
    expect(lostItemStatusTone(LostItemStatusEnum.RESOLVED)).toBe('success');
    expect(lostItemStatusTone(LostItemStatusEnum.CANCELLED)).toBe('danger');
  });

  it('should leave the unknown status without a box', () => {
    expect(lostItemStatusTone('Arquivado')).toBe('neutral');
  });
});
