import type { FormHTMLAttributes } from 'react';
import {
  Button,
  PolymorphicStack,
  radius,
  radiusScale,
  spacing,
  spacingScale,
  styled,
} from '@design-system';

const { xs, lg } = spacingScale;

/** Filho flexível: é ele que cede altura para o miolo rolar na tela baixa. */
export const LostItemForm = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>({
  flexDirection: 'column',
  gap: spacing(lg),
  flexGrow: 1,
  minHeight: 0,
});

export const SubmitButton = styled(Button)({
  gap: spacing(xs),
  borderRadius: radius(radiusScale.component),
});
