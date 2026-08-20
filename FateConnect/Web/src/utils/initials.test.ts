import { describe, expect, it } from 'vitest';

import { getInitials } from './initials';

describe('getInitials', () => {
  it('should take the first letter of the first and last name', () => {
    expect(getInitials('Maria Silva')).toBe('MS');
    expect(getInitials('Maria Silva Santos')).toBe('MS');
  });

  it('should skip name particles so the last name is the one that counts', () => {
    expect(getInitials('Maria da Silva')).toBe('MS');
    expect(getInitials('Pedro de Alcântara dos Santos')).toBe('PS');
    expect(getInitials('Ana e Costa')).toBe('AC');
  });

  it('should return a single letter for a single name', () => {
    expect(getInitials('Maria')).toBe('M');
  });

  it('should uppercase the letters and ignore surrounding whitespace', () => {
    expect(getInitials('  maria   silva  ')).toBe('MS');
  });

  it('should return an empty string when there is no name', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
  });

  it('should fall back to the first word when every word is a particle', () => {
    expect(getInitials('da e')).toBe('D');
  });
});
