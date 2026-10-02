import { spacingScale, Stack, styled } from '@design-system';

const { sm, lg } = spacingScale;

export const SettingRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(sm),
}));

export const PreferencesSections = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(lg),
}));
