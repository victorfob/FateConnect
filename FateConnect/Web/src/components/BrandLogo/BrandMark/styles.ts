import { PolymorphicBox, styled } from '@design-system';

import { BrandMarkToneEnum } from './@types';

const MARK_SIZE_PX = 31;

/** O grupo de cada traço vem marcado no arquivo vetorial; a pintura é daqui. */
const ACCENT_SHAPES = '& [data-shape="accent"]';
const BODY_SHAPES = '& [data-shape="body"]';

export const MarkRoot = styled(PolymorphicBox, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: BrandMarkToneEnum }>(({ theme, tone }) => {
  const mark = {
    display: 'inline-flex',
    '& svg': { width: `${MARK_SIZE_PX}px`, height: `${MARK_SIZE_PX}px` },
  };

  if (tone === BrandMarkToneEnum.CHROME)
    return {
      ...mark,
      [ACCENT_SHAPES]: { fill: theme.palette.chrome.accent },
      [BODY_SHAPES]: { fill: 'currentColor' },
    };

  return {
    ...mark,
    [ACCENT_SHAPES]: { fill: theme.palette.secondary.main },
    [BODY_SHAPES]: { fill: theme.palette.primary.main },
  };
});
