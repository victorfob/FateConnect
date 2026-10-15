import { ReportsTab } from './components/ReportsTab';
import { UsersTab } from './components/UsersTab';
import { useManagementTab } from './hooks/useManagementTab';
import { ManagementTabEnum } from './types';

export function Management() {
  const { selectedTab } = useManagementTab();

  if (selectedTab === ManagementTabEnum.USERS) return <UsersTab />;

  return <ReportsTab />;
}
