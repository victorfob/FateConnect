import { useCallback, useState, type ReactNode } from 'react';
import { Button, Dialog, IconButton, Input } from '@design-system';
import { DeleteIcon, DeleteOutlinedIcon } from '@design-system/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import type { RemovalReasonEnum } from '@app/services/moderation/types';

import {
  EMPTY_REMOVAL_FORM,
  removalFormSchema,
  type RemovalFormInput,
  type RemovalFormValues,
} from './schema';
import * as C from './constants';

export type PublicationRemovalProps = Readonly<{
  /** A frase do diálogo: o que sai das listas e quem é avisado. */
  children: ReactNode;
  remove: (reason: RemovalReasonEnum) => Promise<void>;
  queryKey: string;
  messages: Readonly<{ succeeded: string; failed: string }>;
}>;

/**
 * A exclusão por quem administra: a lixeira no cartão de outra pessoa e o
 * diálogo que pede o motivo. ⛔ Conveniência, não segurança: quem barra é a API.
 */
export function PublicationRemoval({
  children,
  remove,
  queryKey,
  messages,
}: PublicationRemovalProps) {
  const [open, setOpen] = useState(false);
  const { notifySuccess } = useNotification();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ reason }: RemovalFormValues) => remove(reason),
    onSuccess: async () => {
      notifySuccess(messages.succeeded);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    meta: { errorMessage: messages.failed },
  });

  const form = useForm<RemovalFormInput, unknown, RemovalFormValues>({
    resolver: zodResolver(removalFormSchema),
    defaultValues: EMPTY_REMOVAL_FORM,
    disabled: isPending,
  });
  const {
    control,
    reset,
    formState: { errors },
  } = form;

  const handleAsk = useCallback(() => {
    reset(EMPTY_REMOVAL_FORM);
    setOpen(true);
  }, [reset]);
  const handleDismiss = useCallback(() => setOpen(false), []);
  const handleSubmit = form.handleSubmit((values) => mutate(values));

  return (
    <>
      <IconButton type="button" size="small" label={C.REMOVAL_DIALOG.trigger} onClick={handleAsk}>
        <DeleteIcon />
      </IconButton>

      <Dialog open={open} onClose={handleDismiss} title={C.REMOVAL_DIALOG.title}>
        <Dialog.Form onSubmit={handleSubmit}>
          <Dialog.Body>
            <Dialog.Message tone="error" icon={DeleteOutlinedIcon}>
              {children}
            </Dialog.Message>

            <Dialog.Fields layout="column">
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Input.Select
                    {...field}
                    label={C.REMOVAL_DIALOG.reasonLabel}
                    options={C.REASON_SELECT_OPTIONS}
                    required
                    error={errors.reason?.message}
                  />
                )}
              />
            </Dialog.Fields>
          </Dialog.Body>

          <Dialog.Footer>
            <Button type="button" variant="contained" color="primary" onClick={handleDismiss}>
              {C.REMOVAL_DIALOG.dismissLabel}
            </Button>
            <Button type="submit" variant="contained" color="secondary" loading={isPending}>
              {C.REMOVAL_DIALOG.confirmLabel}
            </Button>
          </Dialog.Footer>
        </Dialog.Form>
      </Dialog>
    </>
  );
}
