import { render } from '@app/test/testing-library';

import { ThemeProvider } from '../ThemeProvider';
import { BRAND_FONT_NAME, fontFamily, typographyTokens } from '../tokens';
import { fontFaces, SHIPPED_FONT_WEIGHTS } from '.';

const FONT_FACE = /@font-face\s*\{[^}]*\}/g;

const declaredFaces = () => fontFaces.match(FONT_FACE) ?? [];

const withoutSpaces = (css: string) => css.replaceAll(/\s/g, '');

describe('brand font', () => {
  it('should declare one swapping woff2 face of the brand font per shipped weight', () => {
    const faces = declaredFaces();

    expect(faces).toHaveLength(SHIPPED_FONT_WEIGHTS.size);
    for (const weight of SHIPPED_FONT_WEIGHTS) {
      const face = faces.find((declared) => declared.includes(`font-weight: ${weight};`));

      expect(face).toContain(`font-family: '${BRAND_FONT_NAME}'`);
      expect(face).toContain('font-display: swap');
      expect(face).toMatch(/src: url\('[^']+\.woff2'\) format\('woff2'\)/);
    }
  });

  it('should fall back to the system sans-serif when the brand font does not load', () => {
    expect(fontFamily).toBe(`'${BRAND_FONT_NAME}', sans-serif`);
  });

  it('should ask the typography only for weights the shipped font has', () => {
    const weights = Object.values(typographyTokens).map((token) => token.fontWeight);

    expect(weights.filter((weight) => !SHIPPED_FONT_WEIGHTS.has(weight))).toEqual([]);
  });

  it('should load every brand font face with the theme', () => {
    render(<ThemeProvider>{null}</ThemeProvider>);

    const styles = [...document.querySelectorAll('style')]
      .map((style) => style.textContent)
      .join('');

    // O Emotion tira os espaços da folha que ele escreve.
    expect(new Set(withoutSpaces(styles).match(FONT_FACE))).toEqual(
      new Set(declaredFaces().map(withoutSpaces)),
    );
  });
});
