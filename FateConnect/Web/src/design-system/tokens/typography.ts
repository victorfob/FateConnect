export type TypographyToken = {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
};

export const fontFamily = "'Inter', 'Helvetica Neue', sans-serif";

/**
 * Escala tipográfica do produto. Os valores são os mesmos já implementados —
 * a migração não altera a escala, só onde ela vive.
 */
export const typographyTokens = {
  h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
  h1Narrow: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
  subtitle: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
  subtitleBold: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.5 },
  caption: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.4 },
  captionBold: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.4 },
  logo: { fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.2 },
} satisfies Record<string, TypographyToken>;
