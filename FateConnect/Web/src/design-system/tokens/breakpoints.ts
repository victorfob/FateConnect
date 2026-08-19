/**
 * Larguras máximas dos breakpoints do produto. Não coincidem com os do MUI
 * (`md` = 900px), por isso são declaradas aqui e usadas direto nos estilos.
 */
export const COMPACT_MAX_WIDTH_PX = 600;
export const MOBILE_MAX_WIDTH_PX = 768;
export const TABLET_MAX_WIDTH_PX = 968;

/** Consulta mais estreita, usada pelo cartão de carona ao empilhar a etiqueta. */
export const compactMedia = `@media (max-width: ${COMPACT_MAX_WIDTH_PX}px)`;

/** Media query de mobile (topo, rodapé, menu lateral, cartões). */
export const mobileMedia = `@media (max-width: ${MOBILE_MAX_WIDTH_PX}px)`;

/** Media query intermediária usada pela landing para empilhar apresentação e login. */
export const tabletMedia = `@media (max-width: ${TABLET_MAX_WIDTH_PX}px)`;

/**
 * Consulta de desktop do cadastro. É o **complemento** de `mobileMedia`, não o
 * seu espelho: a tela de cadastro declara `min-width: 768px`, então em exatos
 * 768px ela já usa a grade de seis colunas. Manter a assimetria é paridade.
 */
export const desktopMedia = `@media (min-width: ${MOBILE_MAX_WIDTH_PX}px)`;
