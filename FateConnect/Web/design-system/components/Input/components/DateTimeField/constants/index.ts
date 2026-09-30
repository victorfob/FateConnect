import type { DateOrTimeView } from '@mui/x-date-pickers/models';

export const DATE_TIME_PLACEHOLDER = 'dd/mm/aaaa hh:mm';

/** `dd/mm/aaaa hh:mm` — o campo não aceita mais que isso. */
export const MASKED_DATE_TIME_LENGTH = 16;

/**
 * Nenhum botão na barra da biblioteca: o painel é conteúdo do nosso popover, e
 * não o seletor dono do próprio ciclo. O de avançar fica inerte com a vista
 * controlada, e o de confirmar não reage sem mudança pendente.
 */
export const PICKER_SLOT_PROPS = { actionBar: { actions: [] } };

export const DAY_VIEW = 'day';
export const HOURS_VIEW = 'hours';
export const MINUTES_VIEW = 'minutes';

/**
 * Sem `year`: ele é um botão no topo do painel, e o cabeçalho do calendário
 * logo abaixo já mostra o ano.
 */
export const PICKER_VIEWS: readonly DateOrTimeView[] = [DAY_VIEW, HOURS_VIEW, MINUTES_VIEW];
