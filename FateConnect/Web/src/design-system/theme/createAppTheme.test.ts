import { describe, expect, it } from 'vitest';

import { colorTokens, spacingScale, typographyTokens } from '../tokens';
import { createAppTheme } from './createAppTheme';

describe('createAppTheme', () => {
  it('usa a escala de tokens em rem, e não o multiplicador de 8px padrão do MUI', () => {
    const theme = createAppTheme();

    // Sem o override, theme.spacing(16) devolveria '128px' e o layout ficaria 8x errado.
    expect(theme.spacing(spacingScale.md)).toBe('1rem');
    expect(theme.spacing(spacingScale.xs)).toBe('0.5rem');
    expect(theme.spacing(spacingScale.md)).not.toBe('128px');
  });

  it('expõe as variantes de tipografia do produto com os valores da escala atual', () => {
    const { typography } = createAppTheme();

    expect(typography.h2).toMatchObject(typographyTokens.h2);
    expect(typography.subtitle).toMatchObject(typographyTokens.subtitle);
    expect(typography.subtitleBold).toMatchObject(typographyTokens.subtitleBold);
    expect(typography.caption).toMatchObject(typographyTokens.caption);
    expect(typography.captionBold).toMatchObject(typographyTokens.captionBold);
    expect(typography.logo).toMatchObject(typographyTokens.logo);
  });

  it('reduz o h1 em tela estreita, mantendo peso e altura de linha', () => {
    const { typography } = createAppTheme();

    expect(typography.h1.fontSize).toBe(typographyTokens.h1.fontSize);
    expect(JSON.stringify(typography.h1)).toContain(typographyTokens.h1Narrow.fontSize);
  });

  it('aplica a paleta do produto', () => {
    const { palette } = createAppTheme();

    expect(palette.primary.main).toBe(colorTokens.primary);
    expect(palette.secondary.main).toBe(colorTokens.accent);
    expect(palette.background.default).toBe(colorTokens.surfaceGray);
  });
});
