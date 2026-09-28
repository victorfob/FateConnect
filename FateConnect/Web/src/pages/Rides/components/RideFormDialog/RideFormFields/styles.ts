import { Box, spacingScale, styled } from '@design-system';

const { sm, md } = spacingScale;

export const FieldsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.space(md),
  // Editando, os campos chegam preenchidos e o rótulo sobe acima da borda. Sem
  // este respiro a primeira linha sairia cortada pela rolagem do diálogo.
  paddingTop: theme.space(sm),

  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}));

export const WideCell = styled(Box)({ gridColumn: '1 / -1' });

/** Sem recorrência não há data final ao lado, e a partida ocupa a linha inteira. */
export const DepartureCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isAlone',
})<{ isAlone: boolean }>(({ isAlone }) => {
  if (isAlone) return { gridColumn: '1 / -1' };

  return {};
});
