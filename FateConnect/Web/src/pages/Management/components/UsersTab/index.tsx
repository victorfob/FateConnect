import { useCallback, useMemo, useState } from 'react';
import { CardsList, Pagination } from '@design-system';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotification } from '@app/hooks/useNotification';
import { usePagedSearch } from '@app/hooks/usePagedSearch';
import { loggedUserId } from '@app/services/auth/loggedUser';
import type { UserSummary } from '@app/services/users/managementTypes';
import type { AccountStatusEnum } from '@app/services/users/types';
import { changeUserStatus, listUsers } from '@app/services/users/usersService';
import { PAGE_SIZE } from '@app/utils/searchParams';

import { ManagementShell } from '../ManagementShell';
import { UserCard } from './components/UserCard';
import { UserFormDialog } from './components/UserFormDialog';
import { UsersFilter } from './components/UsersFilter';
import { managementUserCodec } from './helpers/searchQuery';
import * as C from './constants';

const NO_ITEMS = 0;

export function UsersTab() {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const ownUserId = useMemo(() => loggedUserId(), []);

  const { filters, items, totalPages, currentPage, isPending, applyFilters, changePage } =
    usePagedSearch({
      codec: managementUserCodec,
      queryKey: C.USERS_QUERY_KEY,
      listFunction: listUsers,
      errorMessage: C.USER_LIST_MESSAGES.loadFailed,
    });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ user, status }: { user: UserSummary; status: AccountStatusEnum }) =>
      changeUserStatus(user.id, status),
    onSuccess: (_updated, { status }) => {
      notifySuccess(C.statusChangedMessage(status));
      void queryClient.invalidateQueries({ queryKey: [C.USERS_QUERY_KEY] });
    },
    meta: { errorMessage: C.USER_LIST_MESSAGES.statusFailed },
  });

  const handleStatusConfirm = useCallback(
    (user: UserSummary, status: AccountStatusEnum) => changeStatus({ user, status }),
    [changeStatus],
  );

  const handleEdit = useCallback((user: UserSummary) => setEditingUserId(user.id), []);
  const handleEditClose = useCallback(() => setEditingUserId(null), []);

  return (
    <ManagementShell titleAction={<UsersFilter initialFilters={filters} onApply={applyFilters} />}>
      <CardsList
        isLoading={isPending}
        skeletonCount={PAGE_SIZE}
        isEmpty={items.length === NO_ITEMS}
        emptyMessage={C.EMPTY_LIST_MESSAGE}
        pagination={<Pagination count={totalPages} page={currentPage} onChange={changePage} />}
      >
        {items.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isOwnAccount={user.id === ownUserId}
            onEdit={handleEdit}
            onStatusConfirm={handleStatusConfirm}
          />
        ))}
      </CardsList>

      <UserFormDialog
        userId={editingUserId}
        isOwnAccount={editingUserId === ownUserId}
        onClose={handleEditClose}
      />
    </ManagementShell>
  );
}
