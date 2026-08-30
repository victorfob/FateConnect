import { spacingScale, Stack, styled } from '@design-system';

const { sm } = spacingScale;

export const RideList = styled(Stack)({
  flexDirection: 'column',
  width: '100%',
});

export const PaginationRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  paddingTop: theme.space(sm),
}));
