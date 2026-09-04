import { LostItemStatusEnum } from '@app/services/lostAndFound/types';

import {
  lostItemStatusLabel,
  lostItemStatusSlug,
  lostItemStatusTone,
  parseLostItemStatus,
} from './lostItemStatus';

describe('lostItemStatusLabel', () => {
  it('should give each situation the word the screen shows', () => {
    expect(lostItemStatusLabel(LostItemStatusEnum.RESOLVED)).toBe('Resolvido');
    expect(lostItemStatusLabel(LostItemStatusEnum.OPEN)).toBe('Aberto');
    expect(lostItemStatusLabel(LostItemStatusEnum.DELETED)).toBe('Excluído');
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
    expect(lostItemStatusTone(LostItemStatusEnum.DELETED)).toBe('danger');
  });

  it('should leave the unknown status without a box', () => {
    expect(lostItemStatusTone('Arquivado')).toBe('neutral');
    expect(lostItemStatusTone(undefined)).toBe('neutral');
  });
});

describe('lostItemStatusSlug', () => {
  it('should write the word of the screen in the url, never the one of the contract', () => {
    expect(lostItemStatusSlug(LostItemStatusEnum.OPEN)).toBe('aberto');
    expect(lostItemStatusSlug(LostItemStatusEnum.RESOLVED)).toBe('resolvido');
    expect(lostItemStatusSlug(LostItemStatusEnum.DELETED)).toBe('excluido');
  });
});

describe('parseLostItemStatus', () => {
  it('should read back the slug it writes, whatever the case', () => {
    expect(parseLostItemStatus('excluido')).toBe(LostItemStatusEnum.DELETED);
    expect(parseLostItemStatus(' Aberto ')).toBe(LostItemStatusEnum.OPEN);
  });

  it('should refuse the contract value, which does not belong in the url', () => {
    expect(parseLostItemStatus(LostItemStatusEnum.DELETED)).toBeNull();
  });

  it('should give nothing back when the url says nothing it knows', () => {
    expect(parseLostItemStatus('arquivado')).toBeNull();
    expect(parseLostItemStatus(undefined)).toBeNull();
  });
});
