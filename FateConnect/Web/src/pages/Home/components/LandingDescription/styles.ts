import {
  iconSizeTokens,
  mobileMedia,
  PolymorphicBox,
  PolymorphicStack,
  Stack,
  styled,
} from '@design-system';

const MAX_WIDTH_PX = 600;
const TITLE_MAX_WIDTH_PX = 500;
const HIGHLIGHT_MAX_WIDTH_PX = 120;

export const DescriptionRoot = styled(Stack)({
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  maxWidth: `${MAX_WIDTH_PX}px`,
});

export const TitleContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  maxWidth: `${TITLE_MAX_WIDTH_PX}px`,
  justifyContent: 'center',
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const Lead = styled(PolymorphicBox)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
}));

export const HighlightList = styled(PolymorphicStack)({
  listStyle: 'none',
  flexDirection: 'row',
  gap: '1rem',

  [mobileMedia]: { display: 'none' },
});

export const HighlightItem = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: '12px',
  maxWidth: `${HIGHLIGHT_MAX_WIDTH_PX}px`,
  color: theme.palette.text.primary,
  textAlign: 'center',

  '& svg': {
    fontSize: `${iconSizeTokens.sm}px`,
    color: theme.palette.secondary.main,
  },
}));

export const IconDisc = styled(PolymorphicStack)({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});
