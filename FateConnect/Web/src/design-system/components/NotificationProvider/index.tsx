import { useCallback, type ReactNode } from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { closeSnackbar, SnackbarProvider } from 'notistack';

import * as S from './styles';

/** Quantos avisos ficam empilhados ao mesmo tempo, como no produto. */
const MAX_STACKED = 3;

/**
 * O produto rotula a ação de dispensar com "OK" na maioria das chamadas — as
 * duas exceções usam "Fechar" para o mesmo tipo de evento, então o rótulo aqui
 * é único.
 */
const DISMISS_LABEL = 'OK';

/** O produto não desenha ícone no aviso; a biblioteca desenha um por variante. */
const NO_ICON: Record<string, ReactNode> = {
  success: null,
  error: null,
  warning: null,
  info: null,
  default: null,
};

/**
 * Avisos com a aparência do produto: fundo pastel por estado, texto apagado,
 * sem ícone e com ação de dispensar. A duração fica com quem dispara — ela
 * varia por tipo de aviso.
 */
export function NotificationProvider({ children }: Readonly<{ children: ReactNode }>) {
  const renderDismiss = useCallback(
    (key: string | number) => (
      <S.DismissButton onClick={() => closeSnackbar(key)}>{DISMISS_LABEL}</S.DismissButton>
    ),
    [],
  );

  return (
    <SnackbarProvider
      maxSnack={MAX_STACKED}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      iconVariant={NO_ICON}
      action={renderDismiss}
    >
      <GlobalStyles styles={S.notificationStyles} />
      {children}
    </SnackbarProvider>
  );
}
