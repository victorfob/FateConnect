import { colorTokens, spacingScale, typographyTokens, type TypographyToken } from '../tokens';
import { createAppTheme } from './createAppTheme';
import { spacing } from './helpers/spacing';

describe('createAppTheme', () => {
  it('should keep the mui spacing untouched so its own components are not shrunk', () => {
    const theme = createAppTheme();

    // O MUI chama theme.spacing(1..3) internamente — gutters do Toolbar, padding
    // de Dialog e de Card. Sobrescrever isso encolhia as gutters de 24px para 3px.
    expect(theme.spacing(1)).toBe('8px');
    expect(theme.spacing(3)).toBe('24px');
  });

  it('should convert our px tokens to rem through the design system helper', () => {
    expect(spacing(spacingScale.md)).toBe('1rem');
    expect(spacing(spacingScale.xs)).toBe('0.5rem');
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

  // A consulta precisa ser a do produto (768px). Com o `sm` do MUI (600px) o
  // título ficava grande entre os dois pontos, e o teste antigo — que só
  // procurava o tamanho reduzido em algum lugar do objeto — não acusava.
  it('should shrink h1 at the product breakpoint keeping weight and line height', () => {
    const theme = createAppTheme();
    const h1 = theme.typography.h1 as unknown as Record<string, TypographyToken>;

    expect(theme.typography.h1.fontSize).toBe(typographyTokens.h1.fontSize);
    // A consulta escrita à mão no tema precisa ser a mesma que o MUI gera.
    expect(h1[theme.breakpoints.down('md')]).toMatchObject(typographyTokens.h1Narrow);
  });

  it('should apply the product palette', () => {
    const { palette } = createAppTheme();

    expect(palette.primary.main).toBe(colorTokens.primary);
    expect(palette.secondary.main).toBe(colorTokens.accent);
    expect(palette.background.default).toBe(colorTokens.surfaceGray);
  });
});
