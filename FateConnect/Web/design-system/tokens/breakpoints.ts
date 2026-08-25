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
 * **O valor é medido, não escolhido: quem manda é o cabeçalho.** Logo (128px),
 * nav (506px) e botão de tema (40px) somam 674px de conteúdo, mais 224px de
 * goteira. Abaixo disso a nav quebra em duas linhas e monta sobre o logo — em
 * 800px a barra sai com 80px de altura no lugar de 36px, medido.
 *
 * ⛔ Ao mexer no conteúdo do cabeçalho, **remeça**: acrescentar um item de menu
 * empurra este número para cima, e o sintoma aparece só entre este limite e o
 * ponto onde a nav ainda cabia.
 */
export const DESKTOP_MIN_WIDTH_PX = 933;
