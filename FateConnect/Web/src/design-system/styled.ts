import type { Theme as AppTheme } from '@mui/material/styles';

export { css, keyframes } from '@emotion/react';
export { default as styled } from '@emotion/styled';
export { darken, lighten, alpha } from '@mui/material/styles';

/**
 * O `styled` do Emotion tipa `theme` como `Theme` do `@emotion/react`, que é
 * vazio por padrão. Aumentar aqui faz o tema da aplicação valer no callback de
 * qualquer `styled`, sem cada arquivo precisar tipar de novo.
 */
declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends AppTheme {}
}

import type { ElementType } from 'react';

/**
 * O `styled` do Emotion não preserva a assinatura polimórfica do `Box`, então a
 * prop `component` some da tipagem. Declarar este genérico devolve a prop:
 * `styled(Box)<PolymorphicProps>({ ... })`.
 *
 * Quando o elemento alvo tem props próprias — um `NavLink` com `to`, por
 * exemplo —, declare-as no parâmetro:
 * `styled(Box)<PolymorphicProps<Pick<NavLinkProps, 'to'>>>({ ... })`.
 */
export type PolymorphicProps<TargetProps = unknown> = { component?: ElementType } & TargetProps;
