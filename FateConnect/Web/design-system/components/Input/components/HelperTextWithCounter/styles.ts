import { PolymorphicBox, PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm } = spacingScale;

export const HelperLine = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.space(sm),
}));

export const HelperMessage = styled(PolymorphicBox)({
  flexGrow: 1,
  minWidth: 0,
});

export const CharacterCounter = styled(PolymorphicBox)({
  flexShrink: 0,
  whiteSpace: 'nowrap',
});
