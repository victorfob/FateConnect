import { useCallback, useMemo, useState } from 'react';
import { useBeforeUnload, useBlocker, type BlockerFunction } from 'react-router';

import { useLeaveInterceptor } from '@app/hooks/useLeaveInterceptor';

/**
 * Segura toda saída da tela com alteração pendente: a navegação pelo roteador,
 * a saída da conta e, com o aviso do próprio navegador, fechar ou recarregar a aba.
 */
export function useLeaveConfirmation(hasChanges: boolean) {
  const [pendingLeave, setPendingLeave] = useState<VoidFunction | null>(null);

  const leavesTheScreen = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      hasChanges && currentLocation.pathname !== nextLocation.pathname,
    [hasChanges],
  );
  const blocker = useBlocker(leavesTheScreen);

  const interceptLeave = useMemo(() => {
    if (!hasChanges) return null;

    return (leave: VoidFunction) => setPendingLeave(() => leave);
  }, [hasChanges]);
  useLeaveInterceptor(interceptLeave);

  const warnBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (hasChanges) event.preventDefault();
    },
    [hasChanges],
  );
  useBeforeUnload(warnBeforeUnload);

  const confirmLeave = useCallback(() => {
    setPendingLeave(null);
    if (pendingLeave) {
      pendingLeave();
      return;
    }

    blocker.proceed?.();
  }, [blocker, pendingLeave]);

  const cancelLeave = useCallback(() => {
    setPendingLeave(null);
    blocker.reset?.();
  }, [blocker]);

  return {
    confirming: blocker.state === 'blocked' || pendingLeave !== null,
    confirmLeave,
    cancelLeave,
  };
}
