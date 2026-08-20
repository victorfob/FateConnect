import { useCallback } from 'react';
import { useSnackbar, type VariantType } from 'notistack';

/**
 * Quanto o aviso fica na tela por padrão. Quem dispara pode pedir outro tempo —
 * o produto varia entre 3000 e 5000 conforme a tela, e amarrar isso à variante
 * criaria uma regra que ninguém consegue justificar depois.
 */
const DEFAULT_AUTO_HIDE_MS = 3000;

type Notify = (message: string, autoHideMs?: number) => void;

type Notifier = {
  notifySuccess: Notify;
  notifyError: Notify;
  notifyWarning: Notify;
};

/** Camada fina sobre o notistack, para a UI não conhecer a biblioteca. */
export function useNotification(): Notifier {
  const { enqueueSnackbar } = useSnackbar();

  const notify = useCallback(
    (variant: VariantType, message: string, autoHideMs: number) => {
      enqueueSnackbar(message, { variant, autoHideDuration: autoHideMs });
    },
    [enqueueSnackbar],
  );

  const notifySuccess = useCallback<Notify>(
    (message, autoHideMs = DEFAULT_AUTO_HIDE_MS) => notify('success', message, autoHideMs),
    [notify],
  );
  const notifyError = useCallback<Notify>(
    (message, autoHideMs = DEFAULT_AUTO_HIDE_MS) => notify('error', message, autoHideMs),
    [notify],
  );
  const notifyWarning = useCallback<Notify>(
    (message, autoHideMs = DEFAULT_AUTO_HIDE_MS) => notify('warning', message, autoHideMs),
    [notify],
  );

  return { notifySuccess, notifyError, notifyWarning };
}
