import type { DateOrTimeView } from '@mui/x-date-pickers/models';

export const DATE_TIME_PLACEHOLDER = 'dd/mm/aaaa hh:mm';

/** `dd/mm/aaaa hh:mm` — o campo não aceita mais que isso. */
export const MASKED_DATE_TIME_LENGTH = 16;

/**
 * Nenhum botão na barra da biblioteca, porque nenhum dos dela funciona aqui: o
 * painel foi feito para ser o seletor inteiro, dono do próprio ciclo, e aqui ele
 * é conteúdo do nosso popover. O de avançar usa um setter que a vista controlada
 * torna inerte, e o de confirmar só reage quando há mudança pendente — abrir e
 * confirmar sem tocar em nada não fazia nada.
 *
 * Quem fecha é escolher o minuto, como no campo só de data escolher o dia.
 */
export const PICKER_SLOT_PROPS = { actionBar: { actions: [] } };

export const DAY_VIEW = 'day';
export const HOURS_VIEW = 'hours';
const MINUTES_VIEW = 'minutes';

/**
 * Sem `year`: ele é um botão no topo do painel, e o cabeçalho do calendário
 * logo abaixo já mostra o ano.
 */
export const PICKER_VIEWS: readonly DateOrTimeView[] = [DAY_VIEW, HOURS_VIEW, MINUTES_VIEW];
