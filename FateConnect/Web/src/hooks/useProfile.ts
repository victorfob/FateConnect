import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';

import { tokenStorage } from '@app/services/auth/tokenStorage';
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

/** A chave leva o token: quem entra depois na mesma aba não herda o perfil de quem saiu. */
export function useProfile({ keepsPreviousProfile = false }: UseProfileOptions = {}) {
  const queryClient = useQueryClient();
  const token = useSyncExternalStore(tokenStorage.subscribe, tokenStorage.getToken);
  const queryKey = useMemo(() => [PROFILE_QUERY_KEY, token], [token]);

  const query = useQuery({
    queryKey,
    queryFn: getProfile,
    enabled: token !== null,
    placeholderData: previousProfilePlaceholder(keepsPreviousProfile),
    meta: { errorMessage: PROFILE_LOAD_FAILED },
  });

  const replaceProfile = useCallback(
    (profile: User) => queryClient.setQueryData(queryKey, profile),
    [queryClient, queryKey],
  );

  return { ...query, replaceProfile };
}
