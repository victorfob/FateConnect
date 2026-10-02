import { spacingScale, styled } from '@design-system';
import { CheckIcon } from '@design-system/icons';

const { md } = spacingScale;

export const ChosenMark = styled(CheckIcon)(({ theme }) => ({
  marginLeft: theme.space(md),
  color: theme.palette.text.secondary,
}));
