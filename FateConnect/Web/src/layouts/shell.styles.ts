import { HEADER_HEIGHT_PX, styled } from '@design-system';

/**
 * Casca comum às duas rotas. O topo é fixo, então o conteúdo reserva a altura
 * dele — mesmo comportamento do produto.
 */
export const ShellRoot = styled('div')({
  minHeight: '100vh',
  paddingTop: `${HEADER_HEIGHT_PX}px`,
  display: 'flex',
  flexDirection: 'column',
});

export const ShellContent = styled('main')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});
