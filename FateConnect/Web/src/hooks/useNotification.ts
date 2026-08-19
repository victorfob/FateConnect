import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

const AUTO_HIDE_MS = 5000;

type Notifier = {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notifyWarning: (message: string) => void;
};

/** Camada fina sobre o notistack, para a UI não conhecer a biblioteca. */
export function useNotification(): Notifier {
  const { enqueueSnackbar } = useSnackbar();

  const notifySuccess = useCallback(
    (message: string) => enqueueSnackbar(message, { variant: 'success' }),
    [enqueueSnackbar],
  );
  const notifyError = useCallback(
    (message: string) => enqueueSnackbar(message, { variant: 'error' }),
    [enqueueSnackbar],
  );
  const notifyWarning = useCallback(
    (message: string) => enqueueSnackbar(message, { variant: 'warning' }),
    [enqueueSnackbar],
  );

  return { notifySuccess, notifyError, notifyWarning };
}

export const NOTIFICATION_AUTO_HIDE_MS = AUTO_HIDE_MS;
