import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { RoutePath } from '@app/routes/paths';
import { scrollToSection } from '@app/utils/scrollToSection';

/**
 * Navegação para as seções da landing. Estando em outra rota, navega para
 * `/inicio` com o fragmento; já estando na landing, apenas rola — o roteador
 * ignora navegação para a mesma rota quando só o fragmento muda.
 */
export function useLandingAnchor(): (sectionId: string) => void {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const cancelPendingScroll = useRef<VoidFunction>(undefined);

  useEffect(() => () => cancelPendingScroll.current?.(), []);

  return useCallback(
    (sectionId: string) => {
      if (pathname !== RoutePath.LANDING) {
        navigate(`${RoutePath.LANDING}#${sectionId}`);
        return;
      }

      cancelPendingScroll.current?.();
      cancelPendingScroll.current = scrollToSection(sectionId);
    },
    [navigate, pathname],
  );
}
