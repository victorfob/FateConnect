/**
 * Larguras máximas dos breakpoints do produto. Não coincidem com os do MUI
 * (`md` = 900px), por isso são declaradas aqui e usadas direto nos estilos.
 */
export const MOBILE_MAX_WIDTH_PX = 768;
export const TABLET_MAX_WIDTH_PX = 968;

/** Media query de mobile (topo, rodapé, menu lateral, cartões). */
export const mobileMedia = `@media (max-width: ${MOBILE_MAX_WIDTH_PX}px)`;

/** Media query intermediária usada pela landing para empilhar apresentação e login. */
export const tabletMedia = `@media (max-width: ${TABLET_MAX_WIDTH_PX}px)`;
