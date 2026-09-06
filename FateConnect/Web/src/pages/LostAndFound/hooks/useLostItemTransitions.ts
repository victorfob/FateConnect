import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotification } from '@app/hooks/useNotification';
import {
  deleteLostItem,
  resolveLostItem,
  restoreLostItem,
} from '@app/services/lostAndFound/lostAndFoundService';
import type { LostItem } from '@app/services/lostAndFound/types';

import * as C from '../constants';

type LostItemTransitions = {
  resolveItem: (item: LostItem) => void;
  deleteItem: (item: LostItem) => void;
  restoreItem: (item: LostItem) => void;
  isTransitioning: boolean;
};

/** Uma mutação por transição: cada uma tem mensagem própria de erro. */
export function useLostItemTransitions(): LostItemTransitions {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();

  const invalidateList = useCallback(
    () => queryClient.invalidateQueries({ queryKey: [C.LOST_ITEMS_QUERY_KEY] }),
    [queryClient],
  );

  const { mutate: resolveItem, isPending: isResolving } = useMutation({
    mutationFn: (item: LostItem) => resolveLostItem(item.id),
    onSuccess: async () => {
      notifySuccess(C.LOST_ITEM_LIST_MESSAGES.resolveSucceeded);
      await invalidateList();
    },
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.resolveFailed },
  });

  const { mutate: deleteItem, isPending: isDeleting } = useMutation({
    mutationFn: (item: LostItem) => deleteLostItem(item.id),
    onSuccess: async () => {
      notifySuccess(C.LOST_ITEM_LIST_MESSAGES.deleteSucceeded);
      await invalidateList();
    },
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.deleteFailed },
  });

  const { mutate: restoreItem, isPending: isRestoring } = useMutation({
    mutationFn: (item: LostItem) => restoreLostItem(item.id),
    onSuccess: async () => {
      notifySuccess(C.LOST_ITEM_LIST_MESSAGES.restoreSucceeded);
      await invalidateList();
    },
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.restoreFailed },
  });

  return {
    resolveItem,
    deleteItem,
    restoreItem,
    isTransitioning: isResolving || isDeleting || isRestoring,
  };
}
