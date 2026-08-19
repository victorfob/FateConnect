import { describe, expect, it } from 'vitest';

import { colorTokens, spacingScale, typographyTokens } from '../tokens';
import { createAppTheme } from './createAppTheme';

describe('createAppTheme', () => {
  it('should use the token scale in rem instead of the default 8px multiplier', () => {
    const theme = createAppTheme();

    // Sem o override, theme.spacing(16) devolveria '128px' e o layout ficaria 8x errado.
    expect(theme.spacing(spacingScale.md)).toBe('1rem');
    expect(theme.spacing(spacingScale.xs)).toBe('0.5rem');
    expect(theme.spacing(spacingScale.md)).not.toBe('128px');
  });

  it('should expose the product typography variants with the current scale values', () => {
    const { typography } = createAppTheme();

    expect(typography.h2).toMatchObject(typographyTokens.h2);
    expect(typography.subtitle).toMatchObject(typographyTokens.subtitle);
    expect(typography.subtitleBold).toMatchObject(typographyTokens.subtitleBold);
    expect(typography.caption).toMatchObject(typographyTokens.caption);
    expect(typography.captionBold).toMatchObject(typographyTokens.captionBold);
    expect(typography.logo).toMatchObject(typographyTokens.logo);
  });

  it('should shrink h1 on narrow screens keeping weight and line height', () => {
    const { typography } = createAppTheme();

    expect(typography.h1.fontSize).toBe(typographyTokens.h1.fontSize);
    expect(JSON.stringify(typography.h1)).toContain(typographyTokens.h1Narrow.fontSize);
  });

  it('should apply the product palette', () => {
    const { palette } = createAppTheme();

    expect(palette.primary.main).toBe(colorTokens.primary);
    expect(palette.secondary.main).toBe(colorTokens.accent);
    expect(palette.background.default).toBe(colorTokens.surfaceGray);
  });
});
