/**
 * Largura máxima tratada como mobile. Reproduz o breakpoint já usado no produto
 * (`max-width: 768px`), que não coincide com o `md` padrão do MUI (900px).
 */
export const MOBILE_MAX_WIDTH_PX = 768;

/** Media query de mobile, para uso direto nos arquivos de estilo. */
export const mobileMedia = `@media (max-width: ${MOBILE_MAX_WIDTH_PX}px)`;
