import {
  iconSizeTokens,
  PolymorphicBox,
  PolymorphicStack,
  spacingScale,
  Stack,
  styled,
} from '@design-system';

const { sm, md, lg } = spacingScale;

const MAX_WIDTH_PX = 600;
const TITLE_MAX_WIDTH_PX = 500;
const HIGHLIGHT_MAX_WIDTH_PX = 120;

export const DescriptionRoot = styled(Stack)(({ theme }) => ({
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(lg),
  maxWidth: `${MAX_WIDTH_PX}px`,
  // Sem isto o `min-width: auto` do flex trava a coluna na largura do conteúdo
  // — a fileira de destaques — e a linha transborda no desktop estreito.
  minWidth: 0,
}));

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

export const HighlightList = styled(PolymorphicStack)(({ theme }) => ({
  listStyle: 'none',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.space(md),

  [theme.breakpoints.down('md')]: { display: 'none' },
}));

export const HighlightItem = styled(PolymorphicStack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.space(sm),
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
