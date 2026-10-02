/** Sugestões por vez: com o teclado do celular aberto, mais que isso rola. */
export const SUGGESTION_LIMIT = 8;

/** Uma referência só, para o filtro não mudar a cada render de quem não passa nada. */
export const NO_SUGGESTIONS: string[] = [];

/** Desliga o histórico do que já se digitou no campo, que o Chrome abriria sobre as sugestões. */
export const HISTORY_OFF_AUTOCOMPLETE = 'off';

/**
 * Em campo que o Chrome toma por endereço, ele ignora o `off` e abre os endereços salvos.
 * Um valor que ele não reconhece tira esse painel, mas devolve o histórico.
 */
export const ADDRESS_OFF_AUTOCOMPLETE = 'suggestions-only';
