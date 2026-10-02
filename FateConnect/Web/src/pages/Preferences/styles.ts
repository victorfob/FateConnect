import { spacingScale, Stack, styled, Typography } from '@design-system';

const { xxs, sm } = spacingScale;

export const SettingRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(sm),
}));

export const SettingText = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xxs),
}));

export const SettingDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
