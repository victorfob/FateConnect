import type { FormHTMLAttributes } from 'react';

import {
  Button,
  radius,
  radiusScale,
  spacing,
  spacingScale,
  Stack,
  styled,
  type PolymorphicProps,
} from '@design-system';

const { xs, lg } = spacingScale;

/** Filho flexível: é ele que cede altura para o miolo rolar na tela baixa. */
export const LostItemForm = styled(Stack)<PolymorphicProps<FormHTMLAttributes<HTMLFormElement>>>({
  flexDirection: 'column',
  gap: spacing(lg),
  flexGrow: 1,
  minHeight: 0,
});

export const SubmitButton = styled(Button)({
  gap: spacing(xs),
  borderRadius: radius(radiusScale.component),
});
