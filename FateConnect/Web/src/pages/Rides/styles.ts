import { Stack, styled } from '@design-system';
import type { PolymorphicProps } from '@design-system';

/** Altura reservada enquanto a lista carrega, para o rodapé não pular. */
const LOADING_MIN_HEIGHT_PX = 300;

export const RideList = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  width: '100%',
});

export const LoadingContainer = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: `${LOADING_MIN_HEIGHT_PX}px`,
  width: '100%',
});
