import type { ButtonHTMLAttributes } from 'react';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { radiusScale, spacingScale } from '@ds-root/tokens';

const { xxs, md } = spacingScale;

const TAB_GAP = '3px';

export const TabButton = styled(PolymorphicStack)<ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ theme }) => ({
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: TAB_GAP,
    padding: theme.space(md, xxs),
    border: 0,
    background: 'transparent',
    color: theme.palette.text.primary,
    cursor: 'pointer',

    '&:first-of-type': {
      borderTopLeftRadius: theme.radius(radiusScale.component),
      borderBottomLeftRadius: theme.radius(radiusScale.component),
    },
    '&:last-of-type': {
      borderTopRightRadius: theme.radius(radiusScale.component),
      borderBottomRightRadius: theme.radius(radiusScale.component),
    },

    '&[aria-selected="true"]': {
      background: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
    },
  }),
);
