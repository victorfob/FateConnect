import { HEADER_HEIGHT_PX, Stack, styled, type PolymorphicProps } from '@design-system';

/**
 * Casca comum às duas rotas. O topo é fixo, então o conteúdo reserva a altura
 * dele — mesmo comportamento do produto.
 */
export const ShellRoot = styled(Stack)<PolymorphicProps>({
  minHeight: '100vh',
  paddingTop: `${HEADER_HEIGHT_PX}px`,
  flexDirection: 'column',
});

export const ShellContent = styled(Stack)<PolymorphicProps>({
  flex: 1,
  flexDirection: 'column',
});
