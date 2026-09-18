import { PageMessage } from '@design-system';

import { ManagementShell } from '../ManagementShell';
import * as C from '../../constants';

export function UsersTab() {
  return (
    <ManagementShell>
      <PageMessage title={C.UNAVAILABLE_TITLE} description={C.USERS_DESCRIPTION} />
    </ManagementShell>
  );
}
