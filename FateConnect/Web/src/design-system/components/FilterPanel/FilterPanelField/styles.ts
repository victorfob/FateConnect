import Stack from '@mui/material/Stack';

import { styled, type PolymorphicProps } from '@src-ds/styled';

export const FieldCell = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  width: '100%',
});
