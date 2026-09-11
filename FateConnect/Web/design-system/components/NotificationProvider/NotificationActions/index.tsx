import { useCallback } from 'react';
import { closeSnackbar } from 'notistack';

import * as S from './styles';

/**
 * O produto rotula a ação de dispensar com "OK" na maioria das chamadas — as
 * duas exceções usam "Fechar" para o mesmo tipo de evento, então o rótulo aqui
 * é único.
 */
const DISMISS_LABEL = 'OK';

export type NotificationAction = Readonly<{ label: string; onClick: VoidFunction }>;

type NotificationActionsProps = Readonly<{
  notificationKey: string | number;
  action?: NotificationAction;
}>;

/**
 * ⛔ Desenha a fileira inteira, inclusive quando não há ação própria: o notistack
 * **substitui** a ação do provider pela da chamada em vez de somar as duas, então
 * quem monta uma sem dispensar deixa o aviso sem saída.
 */
export function NotificationActions({ notificationKey, action }: NotificationActionsProps) {
  const dismiss = useCallback(() => closeSnackbar(notificationKey), [notificationKey]);

  const handleAction = useCallback(() => {
    action?.onClick();
    dismiss();
  }, [action, dismiss]);

  return (
    <>
      {action && <S.ActionButton onClick={handleAction}>{action.label}</S.ActionButton>}

      <S.ActionButton onClick={dismiss}>{DISMISS_LABEL}</S.ActionButton>
    </>
  );
}
