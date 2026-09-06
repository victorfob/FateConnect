import { LostItemKindEnum } from '@app/services/lostAndFound/types';

import { lostItemKindLabel, lostItemKindSlug, parseLostItemKind } from './lostItemKind';

describe('lostItemKindLabel', () => {
  it('should show the kind in the language of the screen, not of the contract', () => {
    expect(lostItemKindLabel(LostItemKindEnum.FOUND)).toBe('Achado');
    expect(lostItemKindLabel(LostItemKindEnum.LOST)).toBe('Perdido');
  });

  it('should fall back to the raw value when the kind is unknown', () => {
    expect(lostItemKindLabel('Emprestado')).toBe('Emprestado');
  });
});

describe('lostItemKindSlug', () => {
  it('should write the word of the screen in the url, never the one of the contract', () => {
    expect(lostItemKindSlug(LostItemKindEnum.FOUND)).toBe('achado');
    expect(lostItemKindSlug(LostItemKindEnum.LOST)).toBe('perdido');
  });
});

describe('parseLostItemKind', () => {
  it('should read back the slug it writes, whatever the case', () => {
    expect(parseLostItemKind('achado')).toBe(LostItemKindEnum.FOUND);
    expect(parseLostItemKind(' PERDIDO ')).toBe(LostItemKindEnum.LOST);
  });

  it('should refuse the contract value, which does not belong in the url', () => {
    expect(parseLostItemKind(LostItemKindEnum.FOUND)).toBeNull();
  });

  it('should give nothing back when the url says nothing it knows', () => {
    expect(parseLostItemKind('emprestado')).toBeNull();
    expect(parseLostItemKind(null)).toBeNull();
    expect(parseLostItemKind('')).toBeNull();
  });
});
