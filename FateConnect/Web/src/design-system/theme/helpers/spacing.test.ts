import { describe, expect, it } from 'vitest';

import { spacingScale } from '../../tokens';
import { spacing } from './spacing';

describe('spacing', () => {
  it('converte pixels para rem na base 16', () => {
    expect(spacing(spacingScale.none)).toBe('0rem');
    expect(spacing(spacingScale.xs)).toBe('0.5rem');
    expect(spacing(spacingScale.md)).toBe('1rem');
    expect(spacing(spacingScale.xxxl)).toBe('4rem');
  });

  it('aceita múltiplos valores, como o spacing do MUI', () => {
    expect(spacing(spacingScale.xs, spacingScale.md)).toBe('0.5rem 1rem');
  });
});
