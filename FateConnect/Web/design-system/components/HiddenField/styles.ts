import type { ComponentPropsWithRef } from 'react';

import { PolymorphicBox } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';

const HAIRLINE = '1px';

/**
 * Fora da vista, mas dentro da árvore de acessibilidade e ainda focável — é o
 * que separa esta técnica de `display: none`, que remove o elemento das duas.
 *
 * Serve tanto para texto que só o leitor de tela ouve quanto para campo que só
 * um botão aciona, então aceita as props de `input`: todas opcionais, e quem
 * renderiza um `span` simplesmente não passa nenhuma.
 */
export const HiddenRoot = styled(PolymorphicBox)<ComponentPropsWithRef<'input'>>({
  position: 'absolute',
  width: HAIRLINE,
  height: HAIRLINE,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});
