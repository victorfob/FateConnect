import { colorTokens, iconSizeTokens, mobileMedia, styled } from '@design-system';

const MAX_WIDTH_PX = 600;
const TITLE_MAX_WIDTH_PX = 500;
const HIGHLIGHT_MAX_WIDTH_PX = 120;

export const DescriptionRoot = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  maxWidth: `${MAX_WIDTH_PX}px`,
});

export const TitleContainer = styled('div')({
  display: 'flex',
  maxWidth: `${TITLE_MAX_WIDTH_PX}px`,
  justifyContent: 'center',
  color: colorTokens.primary,
  textAlign: 'center',
});

export const Lead = styled('p')({
  color: colorTokens.textMuted,
  textAlign: 'center',
});

export const HighlightList = styled('ul')({
  listStyle: 'none',
  display: 'flex',
  gap: '1rem',

  [mobileMedia]: { display: 'none' },
});

export const HighlightItem = styled('li')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  maxWidth: `${HIGHLIGHT_MAX_WIDTH_PX}px`,
  color: colorTokens.primary,
  textAlign: 'center',

  '& svg': {
    fontSize: `${iconSizeTokens.sm}px`,
    color: colorTokens.accent,
  },
});

export const IconDisc = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
