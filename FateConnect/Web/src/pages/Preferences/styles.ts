import { spacingScale, Stack, styled } from '@design-system';

const { sm } = spacingScale;

export const SettingRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.space(sm),
}));
