import type { FormHTMLAttributes } from 'react';
import {
  Button,
  PolymorphicStack,
  radiusScale,
  spacingScale,
  styled,
  Typography,
} from '@design-system';

const { xs, lg } = spacingScale;

/** Filho flexível: é ele que cede altura para o miolo rolar na tela baixa. */
export const DenunciationForm = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(
  ({ theme }) => ({
    flexDirection: 'column',
    gap: theme.space(lg),
    flexGrow: 1,
    minHeight: 0,
  }),
);

export const ChannelNote = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  gap: theme.space(xs),
  borderRadius: theme.radius(radiusScale.component),
}));
