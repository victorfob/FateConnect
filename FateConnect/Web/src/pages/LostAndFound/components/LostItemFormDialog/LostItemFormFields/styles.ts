import { Box, mobileMedia, spacing, spacingScale, styled } from '@design-system';

const { sm, md } = spacingScale;

export const FieldsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: spacing(md),
  // Respiro para o rótulo do campo preenchido não sair cortado na rolagem.
  paddingTop: spacing(sm),

  [mobileMedia]: { gridTemplateColumns: '1fr' },
});

export const WideCell = styled(Box)({ gridColumn: '1 / -1' });
