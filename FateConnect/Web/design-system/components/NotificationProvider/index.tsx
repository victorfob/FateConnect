import { useCallback, type ReactNode } from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { SnackbarProvider } from 'notistack';

import { NotificationActions } from './NotificationActions';
import * as S from './styles';

const MAX_STACKED = 3;

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
    (key: string | number) => <NotificationActions notificationKey={key} />,
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
