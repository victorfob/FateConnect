import type { ButtonHTMLAttributes } from 'react';
import Stack from '@mui/material/Stack';

import { styled, type PolymorphicProps } from '@ds-root/styled';
import { radius } from '@ds-root/theme/helpers/radius';
import { spacing } from '@ds-root/theme/helpers/spacing';
import { radiusScale, spacingScale } from '@ds-root/tokens';

const { xxs, md } = spacingScale;

const TAB_GAP = '3px';

export const TabButton = styled(Stack)<PolymorphicProps<ButtonHTMLAttributes<HTMLButtonElement>>>(
  ({ theme }) => ({
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: TAB_GAP,
    padding: spacing(md, xxs),
    border: 0,
    background: 'transparent',
    color: theme.palette.text.primary,
    cursor: 'pointer',

    '&:first-of-type': {
      borderTopLeftRadius: radius(radiusScale.component),
      borderBottomLeftRadius: radius(radiusScale.component),
    },
    '&:last-of-type': {
      borderTopRightRadius: radius(radiusScale.component),
      borderBottomRightRadius: radius(radiusScale.component),
    },

    '&[aria-selected="true"]': {
      background: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },
  }),
);
