import { useCallback } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionQueryKey } from '@app/hooks/useSessionQueryKey';
import { getProfile } from '@app/services/users/profileService';
import type { User } from '@app/services/users/types';

const PROFILE_QUERY_KEY = 'profile';
const PROFILE_LOAD_FAILED = 'Erro ao carregar o perfil. Tente novamente.';

type UseProfileOptions = Readonly<{
  /** Trocar a senha troca o token, e a tela de perfil não pode sumir enquanto a chave nova carrega. */
  keepsPreviousProfile?: boolean;
}>;

function previousProfilePlaceholder(keepsPreviousProfile: boolean) {
  if (keepsPreviousProfile) return keepPreviousData;

  return undefined;
}

export function useProfile({ keepsPreviousProfile = false }: UseProfileOptions = {}) {
  const queryClient = useQueryClient();
  const { queryKey, signedIn } = useSessionQueryKey(PROFILE_QUERY_KEY);

  const query = useQuery({
    queryKey,
    queryFn: getProfile,
    enabled: signedIn,
    placeholderData: previousProfilePlaceholder(keepsPreviousProfile),
    meta: { errorMessage: PROFILE_LOAD_FAILED },
  });

  const replaceProfile = useCallback(
    (profile: User) => queryClient.setQueryData(queryKey, profile),
    [queryClient, queryKey],
  );

  return { ...query, replaceProfile };
}
