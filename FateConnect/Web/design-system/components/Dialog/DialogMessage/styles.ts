import Typography from '@mui/material/Typography';

import { styled } from '@ds-root/styled';

import { alignedWithTitle } from '../styles';

export const MessageText = styled(Typography)(({ theme }) => alignedWithTitle(theme));
