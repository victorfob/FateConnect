export type SpacingToken =
  'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'huge' | 'giant';

/**
 * Escala de espaçamento em **pixels**, derivada dos valores já praticados no produto.
 * A conversão para `rem` acontece no helper de spacing do tema — nunca aqui.
 */
export const spacingScale: Record<SpacingToken, number> = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 80,
  giant: 112,
};
