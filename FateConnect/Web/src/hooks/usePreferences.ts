import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { PREFERENCES_MESSAGES } from '@app/constants/preferences';
import { useSessionQueryKey } from '@app/hooks/useSessionQueryKey';
import { getPreferences } from '@app/services/users/preferencesService';
import type { Preferences } from '@app/services/users/preferencesTypes';

const PREFERENCES_QUERY_KEY = 'preferences';

export function usePreferences({ enabled = true }: Readonly<{ enabled?: boolean }> = {}) {
  const queryClient = useQueryClient();
  const { queryKey, signedIn } = useSessionQueryKey(PREFERENCES_QUERY_KEY);

  const query = useQuery({
    queryKey,
    queryFn: getPreferences,
    enabled: signedIn && enabled,
    meta: { errorMessage: PREFERENCES_MESSAGES.loadFailed },
  });

  const replacePreferences = useCallback(
    (preferences: Preferences) => queryClient.setQueryData(queryKey, preferences),
    [queryClient, queryKey],
  );

  return { ...query, replacePreferences };
}
