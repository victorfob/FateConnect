import { Box, spacingScale, Stack, styled, Typography } from '@design-system';

const { none, sm } = spacingScale;

/** O recortador ocupa o contêiner por posição absoluta, e sem altura ele some. */
const CROP_AREA_HEIGHT_PX = 280;

export const CropArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: `${CROP_AREA_HEIGHT_PX}px`,
  overflow: 'hidden',
  borderRadius: theme.radius(sm),
  backgroundColor: theme.palette.chrome.main,
}));

export const CropControls = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(sm),
}));

/** A bolinha do zoom tem o centro na ponta do trilho: com este recuo, a borda dela fica no alinhamento do texto. */
export const ZoomControl = styled(Box)(({ theme }) => ({
  padding: theme.space(none, sm),
}));

export const CropHint = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
