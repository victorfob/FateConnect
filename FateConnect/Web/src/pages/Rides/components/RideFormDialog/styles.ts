import type { FormHTMLAttributes } from 'react';
import { Button, PolymorphicStack, radiusScale, spacingScale, styled } from '@design-system';

const { xs, lg } = spacingScale;

/**
 * O formulário entra entre o título e o rodapé do esqueleto, no lugar que seria
 * dos slots. Por isso ele repete o comportamento de filho flexível: é quem cede
 * altura para o miolo rolar quando a tela é baixa.
 */
export const RideForm = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(
  ({ theme }) => ({
    flexDirection: 'column',
    gap: theme.space(lg),
    flexGrow: 1,
    minHeight: 0,
  }),
);

export const SubmitButton = styled(Button)(({ theme }) => ({
  gap: theme.space(xs),
  borderRadius: theme.radius(radiusScale.component),
}));
