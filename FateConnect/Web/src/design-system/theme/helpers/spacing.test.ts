import { describe, expect, it } from 'vitest';

import { spacingScale } from '../../tokens';
import { spacing } from './spacing';

describe('spacing', () => {
  it('should convert pixels to rem using a 16px root', () => {
    expect(spacing(spacingScale.none)).toBe('0rem');
    expect(spacing(spacingScale.xs)).toBe('0.5rem');
    expect(spacing(spacingScale.md)).toBe('1rem');
    expect(spacing(spacingScale.xxxl)).toBe('4rem');
  });

  it('should accept multiple values like the MUI spacing helper', () => {
    expect(spacing(spacingScale.xs, spacingScale.md)).toBe('0.5rem 1rem');
  });
});
