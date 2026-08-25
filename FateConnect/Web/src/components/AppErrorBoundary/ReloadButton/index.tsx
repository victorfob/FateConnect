import { useCallback } from 'react';
import { Button } from '@design-system';

import { BACK_TO_START_LABEL } from '@app/components/CrashScreen/constants';
import { RoutePathEnum } from '@app/routes/paths';

/**
 * Navegação de página inteira, e não `Link`: este botão só aparece quando a
 * árvore de providers quebrou, e aí não há roteador de pé para navegar por
 * dentro. Recarregar também descarta o estado que levou à quebra.
 */
export function ReloadButton() {
  const handleClick = useCallback(() => {
    window.location.assign(RoutePathEnum.LANDING);
  }, []);

  return (
    <Button variant="contained" color="secondary" onClick={handleClick}>
      {BACK_TO_START_LABEL}
    </Button>
  );
}
