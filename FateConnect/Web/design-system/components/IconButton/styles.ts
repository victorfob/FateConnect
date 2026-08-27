import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';

/**
 * Invólucro do botão: o Material não dispara evento de ponteiro em elemento
 * desabilitado, então sem este intermediário o tooltip do botão desabilitado
 * nunca apareceria.
 */
export const TooltipTarget = styled(PolymorphicStack)({ display: 'inline-flex' });
