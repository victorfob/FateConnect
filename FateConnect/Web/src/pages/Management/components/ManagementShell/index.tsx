import { useCallback, type ReactNode } from 'react';
import { PageShell } from '@design-system';
import { GroupsIcon, SecurityIcon } from '@design-system/icons';

import { BackToMenu } from '@app/components/BackToMenu';
import { useManagementTab } from '@app/pages/Management/hooks/useManagementTab';
import { ManagementTabEnum } from '@app/pages/Management/types';

import * as C from '../../constants';

type ManagementShellProps = Readonly<{
  /** Vai encostado no título, onde as outras telas põem o filtro. */
  titleAction?: ReactNode;
  children: ReactNode;
}>;

/**
 * O cromo comum das abas de gestão. Cada aba o monta por conta própria porque o
 * filtro nasce da busca dela, e a busca precisa estar acima do cabeçalho.
 */
export function ManagementShell({ titleAction, children }: ManagementShellProps) {
  const { selectedTab, selectTab } = useManagementTab();

  const handleUsersClick = useCallback(() => selectTab(ManagementTabEnum.USERS), [selectTab]);
  const handleDenunciationsClick = useCallback(
    () => selectTab(ManagementTabEnum.DENUNCIATIONS),
    [selectTab],
  );

  const isUsersSelected = selectedTab === ManagementTabEnum.USERS;

  return (
    <PageShell
      title={C.MANAGEMENT_TITLE}
      titleAction={titleAction}
      action={<BackToMenu />}
      tabs={
        <>
          <PageShell.Tab
            label={C.USERS_TAB_LABEL}
            icon={<GroupsIcon fontSize="small" />}
            selected={isUsersSelected}
            onClick={handleUsersClick}
          />
          <PageShell.Tab
            label={C.DENUNCIATIONS_TAB_LABEL}
            icon={<SecurityIcon fontSize="small" />}
            selected={!isUsersSelected}
            onClick={handleDenunciationsClick}
          />
        </>
      }
    >
      {children}
    </PageShell>
  );
}
