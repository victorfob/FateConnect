/**
 * Tom da etiqueta de estado. `neutral` é o único que **não desenha caixa**: ele
 * serve o valor desconhecido, que aparece como texto corrido. Estado que precisa
 * parecer etiqueta usa `muted`, e não `neutral`.
 */
export type StatusTagTone = 'neutral' | 'muted' | 'success' | 'warning' | 'danger';

export type NotificationVariant = 'success' | 'error' | 'warning';

/** Fundo e a cor do conteúdo sobre ele — o par que `contrast.test.ts` mede. */
export type SurfacePair = { surface: string; content: string };

/**
 * Cromo da aplicação — topo, rodapé, menu lateral e botão de voltar. O divisor
 * e o realce são próprios porque `palette.divider` e `palette.action.hover` são
 * de superfície neutra e desapareceriam sobre a cor de marca.
 */
export type ChromeColors = { main: string; contrastText: string; divider: string; hover: string };
