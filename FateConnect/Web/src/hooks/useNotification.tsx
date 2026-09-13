import { useCallback } from 'react';
import { NotificationActions, type NotificationAction } from '@design-system';
import { useSnackbar, type VariantType } from 'notistack';

/**
 * Quanto o aviso fica na tela por padrão. Quem dispara pode pedir outro tempo —
 * o produto varia entre 3000 e 5000 conforme a tela, e amarrar isso à variante
 * criaria uma regra que ninguém consegue justificar depois.
 */
const DEFAULT_AUTO_HIDE_MS = 3000;

type NotifyOptions = Readonly<{ autoHideMs?: number; action?: NotificationAction }>;

type Notify = (message: string, options?: NotifyOptions) => void;

type Notifier = {
  notifySuccess: Notify;
  notifyError: Notify;
  notifyWarning: Notify;
};

/**
 * ⛔ Devolve a chave só quando há ação: passá-la como `undefined` sobrescreveria
 * a do provider, e o aviso perderia o botão de dispensar.
 */
function actionOption(action: NotificationAction | undefined) {
  if (!action) return {};

  return {
    action: (key: string | number) => <NotificationActions notificationKey={key} action={action} />,
  };
}

/** Camada fina sobre o notistack, para a UI não conhecer a biblioteca. */
export function useNotification(): Notifier {
  const { enqueueSnackbar } = useSnackbar();

  const notify = useCallback(
    (variant: VariantType, message: string, { autoHideMs, action }: NotifyOptions) => {
      enqueueSnackbar(message, {
        variant,
        autoHideDuration: autoHideMs ?? DEFAULT_AUTO_HIDE_MS,
        ...actionOption(action),
      });
    },
    [enqueueSnackbar],
  );

  const notifySuccess = useCallback<Notify>(
    (message, options = {}) => notify('success', message, options),
    [notify],
  );
  const notifyError = useCallback<Notify>(
    (message, options = {}) => notify('error', message, options),
    [notify],
  );
  const notifyWarning = useCallback<Notify>(
    (message, options = {}) => notify('warning', message, options),
    [notify],
  );

  return { notifySuccess, notifyError, notifyWarning };
}
