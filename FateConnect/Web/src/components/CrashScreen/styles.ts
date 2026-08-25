import { Stack, styled, type PolymorphicProps } from '@design-system';

/**
 * A tela de erro substitui a casca inteira — sem topo e sem rodapé para
 * reservar espaço, ela mesma precisa ocupar a altura da janela.
 */
export const ErrorScreen = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  minHeight: '100vh',
});
