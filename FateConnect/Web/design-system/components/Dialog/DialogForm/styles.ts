import type { FormHTMLAttributes } from 'react';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { lg } = spacingScale;

/**
 * Entra entre o título e o rodapé, no lugar dos slots, então repete o filho
 * flexível da superfície: é quem cede altura para o miolo rolar na tela baixa.
 */
export const FormRegion = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(
  ({ theme }) => ({
    flexDirection: 'column',
    gap: theme.space(lg),
    flexGrow: 1,
    minHeight: 0,
  }),
);
