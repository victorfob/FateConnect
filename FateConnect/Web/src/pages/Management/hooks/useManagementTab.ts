import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { parseManagementTab, TAB_PARAM } from '@app/pages/Management/helpers/searchQuery';
import type { ManagementTabEnum } from '@app/pages/Management/types';

type ManagementTabResult = Readonly<{
  selectedTab: ManagementTabEnum;
  selectTab: (tab: ManagementTabEnum) => void;
}>;

/**
 * A aba mora no endereço, então quem a lê e quem a desenha não precisam de
 * estado compartilhado: os dois perguntam à URL.
 */
export function useManagementTab(): ManagementTabResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTab = useMemo(
    () => parseManagementTab(searchParams.get(TAB_PARAM)),
    [searchParams],
  );

  // Trocar de aba refaz a tela, então o botão voltar sai dela em vez de desfazer
  // aba por aba. A busca da aba anterior não sobrevive: ela era da outra lista.
  const selectTab = useCallback(
    (tab: ManagementTabEnum) =>
      setSearchParams({ [TAB_PARAM]: tab }, { replace: true, preventScrollReset: true }),
    [setSearchParams],
  );

  return { selectedTab, selectTab };
}
