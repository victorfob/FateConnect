import { spacingScale, Stack, styled, Typography } from '@design-system';

const { xxs } = spacingScale;

export const SettingTextRoot = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xxs),
}));

export const SettingDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
