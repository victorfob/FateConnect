import type { ElementType, ReactNode } from 'react';
import Typography from '@mui/material/Typography';

import * as S from './styles';

/**
 * O destino é declarado, não importado: quem compõe passa `component` com o
 * link do roteador em uso — `to` — ou uma âncora — `href` —, e o design system
 * continua sem depender de roteamento.
 */
export type PageShellBackProps = Readonly<{
  label: string;
  icon: ReactNode;
  component?: ElementType;
  to?: string;
  href?: string;
}>;

/** Ação de voltar do cabeçalho. O cromo é daqui; o destino, de quem compõe. */
export function PageShellBack({ label, icon, ...rest }: PageShellBackProps) {
  return (
    <S.BackAction {...rest}>
      {icon}
      <Typography variant="subtitleBold" color="inherit">
        {label}
      </Typography>
    </S.BackAction>
  );
}
