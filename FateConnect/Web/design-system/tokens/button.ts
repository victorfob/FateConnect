export type ButtonSizeToken = 'small' | 'medium' | 'large';

/** Altura em **pixels** de cada `size`, a mesma em toda variante, com ou sem borda. */
export const buttonHeightTokens: Record<ButtonSizeToken, number> = {
  small: 32,
  medium: 36,
  large: 40,
};
