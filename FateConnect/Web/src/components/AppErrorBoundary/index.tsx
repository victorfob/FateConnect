import { useCallback, type ReactNode } from 'react';

import { CrashScreen } from '@app/components/CrashScreen';
import { ErrorBoundary, ErrorTypeEnum, type Scope } from '@app/observability';

import { ReloadButton } from './ReloadButton';

type AppErrorBoundaryProps = Readonly<{ children: ReactNode }>;

/**
 * Rede para quebra na árvore de providers — tema, cache de dados, avisos —, que
 * fica fora do roteador e por isso não passa pelo boundary de rota. Sem ela o
 * resultado é tela branca sem rastro: erro de renderização não chega ao
 * `window.onerror`.
 */
export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  const handleBeforeCapture = useCallback((scope: Scope) => {
    scope.setTag('errorType', ErrorTypeEnum.APP_BOUNDARY);
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <CrashScreen>
          <ReloadButton />
        </CrashScreen>
      }
      beforeCapture={handleBeforeCapture}
    >
      {children}
    </ErrorBoundary>
  );
}
