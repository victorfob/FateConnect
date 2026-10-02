import type { FormHTMLAttributes } from 'react';
import { PolymorphicStack, spacingScale, styled } from '@design-system';

const { lg } = spacingScale;

export const CommunicationsFormRoot = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(
  ({ theme }) => ({
    flexDirection: 'column',
    gap: theme.space(lg),
  }),
);
