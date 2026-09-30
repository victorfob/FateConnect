import { useId, type ReactNode } from 'react';

import * as S from './styles';

export type SectionCardProps = Readonly<{
  /** Sem título, o cartão é só a superfície, e não uma região nomeada. */
  title?: string;
  icon?: ReactNode;
  /** Cresce até o fim da coluna, para as colunas vizinhas terminarem juntas. */
  grow?: boolean;
  children: ReactNode;
}>;

export function SectionCard({ title, icon, grow = false, children }: SectionCardProps) {
  const headingId = useId();

  if (!title)
    return (
      <S.CardRoot grow={grow} component="section">
        {children}
      </S.CardRoot>
    );

  return (
    <S.CardRoot grow={grow} component="section" aria-labelledby={headingId}>
      <S.CardHeading variant="h2" id={headingId}>
        {icon}
        {title}
      </S.CardHeading>

      {children}
    </S.CardRoot>
  );
}
