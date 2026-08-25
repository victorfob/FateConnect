/**
 * O produto tem **duas** visões: mobile e desktop. O limite entra no tema como
 * o `md` do MUI, então `theme.breakpoints.down('md')` é mobile e `up('md')` é
 * desktop — e as duas nunca casam no mesmo pixel, porque o `down` do MUI para
 * em `md - 0.05px`.
 *
 * ⛔ **Só o `md` é sobrescrito.** Entre os componentes do MUI que usamos, apenas
 * `Toolbar` e `Dialog` consultam breakpoints por dentro, e os dois citam `sm`.
 * Mexer no `sm` os encolheria em silêncio; no `md` não alcança nada deles.
 *
 * 769 e não 768 porque o `down` para meio centésimo antes: com 769, a largura
 * 768 continua sendo mobile, que é o limite que o produto pratica.
 */
export const DESKTOP_MIN_WIDTH_PX = 769;
