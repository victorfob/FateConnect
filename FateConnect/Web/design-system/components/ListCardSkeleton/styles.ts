import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';

const TITLE_WIDTH_PX = 176;
const TITLE_HEIGHT_PX = 20;
const INFO_WIDTH_PX = 96;
const LINE_HEIGHT_PX = 14;
const DESCRIPTION_WIDTH = '70%';

export const SkeletonList = styled(Stack)({ flexDirection: 'column', width: '100%' });

export const GhostTitle = styled(Skeleton)({
  width: `${TITLE_WIDTH_PX}px`,
  height: `${TITLE_HEIGHT_PX}px`,
});

export const GhostInfo = styled(Skeleton)({
  width: `${INFO_WIDTH_PX}px`,
  height: `${LINE_HEIGHT_PX}px`,
});

export const GhostDescription = styled(Skeleton)({
  width: DESCRIPTION_WIDTH,
  height: `${LINE_HEIGHT_PX}px`,
});
