import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionQueryKey } from '@app/hooks/useSessionQueryKey';
import { getPreferences } from '@app/services/users/preferencesService';
import type { Preferences } from '@app/services/users/preferencesTypes';

import { PREFERENCES_MESSAGES } from '../constants';

const PREFERENCES_QUERY_KEY = 'preferences';

export function usePreferences() {
  const queryClient = useQueryClient();
  const { queryKey, signedIn } = useSessionQueryKey(PREFERENCES_QUERY_KEY);

  const query = useQuery({
    queryKey,
    queryFn: getPreferences,
    enabled: signedIn,
    meta: { errorMessage: PREFERENCES_MESSAGES.loadFailed },
  });

  const replacePreferences = useCallback(
    (preferences: Preferences) => queryClient.setQueryData(queryKey, preferences),
    [queryClient, queryKey],
  );

  return { ...query, replacePreferences };
}
