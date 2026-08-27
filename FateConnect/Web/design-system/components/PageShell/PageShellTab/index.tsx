import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

import * as S from './styles';

export type PageShellTabProps = Readonly<{
  label: string;
  icon: ReactNode;
  selected: boolean;
  /** A aba em repouso não tem ação: ela já é o que está na tela. */
  onClick?: VoidFunction;
}>;

export function PageShellTab({ label, icon, selected, onClick }: PageShellTabProps) {
  return (
    <S.TabButton
      component="button"
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
    >
      {icon}
      <Typography variant="subtitleBold" color="inherit">
        {label}
      </Typography>
    </S.TabButton>
  );
}
