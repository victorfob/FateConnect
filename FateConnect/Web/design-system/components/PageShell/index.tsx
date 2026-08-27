import type { ReactNode } from 'react';

import { PageShellBack } from './PageShellBack';
import { PageShellTab } from './PageShellTab';
import * as S from './styles';

export type PageShellProps = Readonly<{
  title: string;
  /** Ação do canto do cabeçalho — normalmente `PageShell.Back`. */
  action?: ReactNode;
  /** Abas da tela, montadas com `PageShell.Tab`; a barra é desenhada aqui. */
  tabs?: ReactNode;
  children: ReactNode;
}>;

/**
 * Cromo das telas internas: título, ação de voltar e a barra de abas. Existe um
 * só, e quem precisa dele monta os slots — foi o que evitou a segunda cópia
 * quando achados e perdidos pediu o mesmo cabeçalho de caronas.
 */
function PageShell({ title, action, tabs, children }: PageShellProps) {
  return (
    <S.PageRoot>
      <S.PageHeaderRow>
        <S.PageTitleText variant="h1">{title}</S.PageTitleText>
        {action}
      </S.PageHeaderRow>

      {tabs && <S.TabBar role="tablist">{tabs}</S.TabBar>}

      {children}
    </S.PageRoot>
  );
}

PageShell.Back = PageShellBack;
PageShell.Tab = PageShellTab;

export { PageShell };
