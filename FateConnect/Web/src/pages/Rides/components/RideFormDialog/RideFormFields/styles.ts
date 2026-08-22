import { Box, mobileMedia, spacing, spacingScale, styled } from '@design-system';

const { sm, md } = spacingScale;

export const FieldsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: spacing(md),
  // Editando, os campos chegam preenchidos e o rótulo sobe acima da borda. Sem
  // este respiro a primeira linha sairia cortada pela rolagem do diálogo.
  paddingTop: spacing(sm),

  [mobileMedia]: { gridTemplateColumns: '1fr' },
});

/** Ocupa a linha inteira, em qualquer largura. */
export const WideCell = styled(Box)({ gridColumn: '1 / -1' });
