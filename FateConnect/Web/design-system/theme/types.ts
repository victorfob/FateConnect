/**
 * Tom da etiqueta de estado. `neutral` é o único que **não desenha caixa**: ele
 * serve o valor desconhecido, que aparece como texto corrido. Estado que precisa
 * parecer etiqueta usa `muted`, e não `neutral`.
 */
export type StatusTagTone = 'neutral' | 'muted' | 'success' | 'warning' | 'danger';

export type NotificationVariant = 'success' | 'error' | 'warning';

export type SurfacePair = { surface: string; content: string };

/**
 * Cromo da aplicação. O divisor e o realce são chaves próprias porque
 * `palette.divider` e `palette.action.hover` são de superfície neutra e
 * desapareceriam sobre a cor de marca.
 */
export type ChromeColors = {
  main: string;
  contrastText: string;
  /** A marca desenhada sobre o cromo — capelo do símbolo e inicial de `Connect`. */
  accent: string;
  divider: string;
  hover: string;
};
