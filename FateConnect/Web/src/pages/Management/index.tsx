import { useCallback, useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { PageMessage, PageShell } from '@design-system';
import { ArrowBackIcon, GroupsIcon, SecurityIcon } from '@design-system/icons';

import { RoutePathEnum } from '@app/routes/paths';

import { ManagementTabEnum } from './types';
import * as C from './constants';

export function Management() {
  const [selectedTab, setSelectedTab] = useState(ManagementTabEnum.USERS);

  const handleUsersClick = useCallback(() => setSelectedTab(ManagementTabEnum.USERS), []);
  const handleDenunciationsClick = useCallback(
    () => setSelectedTab(ManagementTabEnum.DENUNCIATIONS),
    [],
  );

  const description = useMemo(() => {
    if (selectedTab === ManagementTabEnum.USERS) return C.USERS_DESCRIPTION;

    return C.DENUNCIATIONS_DESCRIPTION;
  }, [selectedTab]);

  const isUsersSelected = selectedTab === ManagementTabEnum.USERS;

  return (
    <PageShell
      title={C.MANAGEMENT_TITLE}
      action={
        <PageShell.Back
          label={C.BACK_LABEL}
          icon={<ArrowBackIcon fontSize="small" />}
          component={NavLink}
          to={RoutePathEnum.MENU}
        />
      }
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
      <PageMessage title={C.UNAVAILABLE_TITLE} description={description} />
    </PageShell>
  );
}
