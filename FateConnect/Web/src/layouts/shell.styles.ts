import { HEADER_HEIGHT_PX, PolymorphicStack, Stack, styled } from '@design-system';

/**
 * Casca comum às duas rotas. O topo é fixo, então o conteúdo reserva a altura
 * dele — mesmo comportamento do produto.
 */
export const ShellRoot = styled(Stack)({
  minHeight: '100vh',
  paddingTop: `${HEADER_HEIGHT_PX}px`,
  flexDirection: 'column',
});

export const ShellContent = styled(PolymorphicStack)({
  flex: 1,
  flexDirection: 'column',
});
