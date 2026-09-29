import { Box, styled } from '@design-system';

/** Sem recorrência não há data final ao lado, e a partida ocupa a linha inteira. */
export const DepartureCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isAlone',
})<{ isAlone: boolean }>(({ isAlone }) => {
  if (isAlone) return { gridColumn: '1 / -1' };

  return {};
});
