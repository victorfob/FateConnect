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

/**
 * O formulário entra entre o título e o rodapé do esqueleto, no lugar que seria
 * dos slots. Por isso ele repete o comportamento de filho flexível: é quem cede
 * altura para o miolo rolar quando a tela é baixa.
 */
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
