import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotification } from '@app/hooks/useNotification';
import {
  cancelLostItem,
  reopenLostItem,
  resolveLostItem,
} from '@app/services/lostAndFound/lostAndFoundService';
import type { LostItem } from '@app/services/lostAndFound/types';

import * as C from '../constants';

type LostItemTransitions = {
  resolveItem: (item: LostItem) => void;
  cancelItem: (item: LostItem) => void;
  reopenItem: (item: LostItem) => void;
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

  const { mutate: cancelItem, isPending: isCancelling } = useMutation({
    mutationFn: (item: LostItem) => cancelLostItem(item.id),
    onSuccess: async () => {
      notifySuccess(C.LOST_ITEM_LIST_MESSAGES.cancelSucceeded);
      await invalidateList();
    },
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.cancelFailed },
  });

  const { mutate: reopenItem, isPending: isReopening } = useMutation({
    mutationFn: (item: LostItem) => reopenLostItem(item.id),
    onSuccess: async () => {
      notifySuccess(C.LOST_ITEM_LIST_MESSAGES.reopenSucceeded);
      await invalidateList();
    },
    meta: { errorMessage: C.LOST_ITEM_LIST_MESSAGES.reopenFailed },
  });

  return {
    resolveItem,
    cancelItem,
    reopenItem,
    isTransitioning: isResolving || isCancelling || isReopening,
  };
}
