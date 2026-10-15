import { useCallback, useState, type ComponentProps, type ReactNode } from 'react';
import { Button, Dialog, type ButtonProps, type FeedbackTone } from '@design-system';
import { HelpOutlineOutlinedIcon } from '@design-system/icons';

import { InlineLink } from '@app/components/InlineLink';

import { CONFIRMATION } from './constants';

type DialogIcon = NonNullable<ComponentProps<typeof Dialog.Message>['icon']>;

export type ConfirmActionProps = Readonly<
  {
    label: string;
    icon: ReactNode;
    dialogTitle: string;
    messagePrefix: string;
    /** Fecha a frase depois do nome em destaque, para quem precisa dizer mais que o `?`. */
    messageSuffix?: string;
    subject: string;
    confirmLabel: string;
    /** Pinta o gatilho de vermelho, para a ação que desfaz algo que não volta pela tela. */
    destructive?: boolean;
    /** O ícone do diálogo quando a ação tem um símbolo próprio, no lugar do padrão do tom. */
    dialogIcon?: DialogIcon;
    /** O gatilho vira link no meio do texto, sem ícone, para a ação que não é a saída principal. */
    asLink?: boolean;
    onConfirm: VoidFunction;
  } & Pick<ButtonProps, 'size'>
>;

function triggerVariant(destructive: boolean): ButtonProps['variant'] {
  if (destructive) return 'destructive';

  return 'soft';
}

function confirmationTone(destructive: boolean): FeedbackTone {
  if (destructive) return 'error';

  return 'info';
}

/** A confirmação que não destrói pergunta: o ícone é a interrogação, e não o "i" de aviso. */
function confirmationIcon(
  destructive: boolean,
  dialogIcon: DialogIcon | undefined,
): DialogIcon | undefined {
  if (dialogIcon) return dialogIcon;
  if (destructive) return undefined;

  return HelpOutlineOutlinedIcon;
}

/** O botão de uma ação sem volta pela tela e a confirmação que ele abre. */
function ConfirmAction({
  label,
  icon,
  dialogTitle,
  messagePrefix,
  messageSuffix = CONFIRMATION.messageSuffix,
  subject,
  confirmLabel,
  destructive = false,
  dialogIcon,
  asLink = false,
  onConfirm,
  size,
}: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleDismiss = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onConfirm();
  }, [onConfirm]);

  return (
    <>
      {asLink ? (
        <InlineLink onClick={handleAsk}>{label}</InlineLink>
      ) : (
        <Button type="button" variant={triggerVariant(destructive)} size={size} onClick={handleAsk}>
          {icon}
          {label}
        </Button>
      )}

      <Dialog open={confirming} onClose={handleDismiss} title={dialogTitle}>
        <Dialog.Body>
          <Dialog.Message
            tone={confirmationTone(destructive)}
            icon={confirmationIcon(destructive, dialogIcon)}
          >
            {messagePrefix}
            <strong>{subject}</strong>
            {messageSuffix}
          </Dialog.Message>
        </Dialog.Body>

        <Dialog.Footer>
          <Button type="button" variant="contained" color="primary" onClick={handleDismiss}>
            {CONFIRMATION.dismissLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

export { ConfirmAction };
