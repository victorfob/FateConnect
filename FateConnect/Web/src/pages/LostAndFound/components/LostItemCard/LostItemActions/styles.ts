import { spacing, spacingScale, Stack, styled, type PolymorphicProps } from '@design-system';

const { xxs } = spacingScale;

const ACTION_BUTTON_SIZE_PX = 32;
/** O glifo da biblioteca de origem ocupa 70% do botão. */
const ACTION_ICON_SCALE = 0.7;

export const ActionButtons = styled(Stack)<PolymorphicProps>(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',

  '& .MuiIconButton-root': {
    width: `${ACTION_BUTTON_SIZE_PX}px`,
    height: `${ACTION_BUTTON_SIZE_PX}px`,
    padding: spacing(xxs),
    color: theme.palette.text.primary,
  },
  '& .MuiIconButton-root svg': {
    transform: `scale(${ACTION_ICON_SCALE})`,
    transformOrigin: 'center',
  },
}));
