import { useEffect, useMemo } from 'react';
import { Dialog } from '@design-system';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';

import { isContactRequiredError } from '@app/components/ContactRequiredDialog/helpers/isContactRequiredError';
import { useNotification } from '@app/hooks/useNotification';
import { LOST_ITEMS_QUERY_KEY } from '@app/pages/LostAndFound/constants';
import { SessionExpiredError } from '@app/services/httpClient';
import { createLostItem, updateLostItem } from '@app/services/lostAndFound/lostAndFoundService';
import type { LostItem, LostItemInput } from '@app/services/lostAndFound/types';

import { toFormValues, toLostItemInput } from './helpers/mapper';
import { LostItemFormFields } from './LostItemFormFields';
import {
  EMPTY_LOST_ITEM_FORM,
  lostItemFormSchema,
  type LostItemFormInput,
  type LostItemFormValues,
} from './schema';
import * as C from './constants';

export type LostItemFormDialogProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  item?: LostItem;
  /** A API recusou por falta de contato: quem abriu o diálogo mostra o aviso. */
  onContactRequired: VoidFunction;
}>;

export function LostItemFormDialog({
  open,
  onClose,
  item,
  onContactRequired,
}: LostItemFormDialogProps) {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotification();

  const mode = useMemo(() => {
    if (!item) return C.REGISTER_MODE;

    return C.EDIT_MODE;
  }, [item]);

  const { mutate, isPending } = useMutation({
    mutationFn: (input: LostItemInput) => {
      if (!item) return createLostItem(input);

      return updateLostItem(item.id, input);
    },
    onSuccess: async () => {
      notifySuccess(mode.succeeded);
      onClose();
      await queryClient.invalidateQueries({ queryKey: [LOST_ITEMS_QUERY_KEY] });
    },
    // Não fecha no erro: refazer o formulário inteiro puniria quem já digitou.
    onError: (error) => {
      if (error instanceof SessionExpiredError) return;

      if (isContactRequiredError(error)) {
        onClose();
        onContactRequired();
        return;
      }

      notifyError(mode.failed);
    },
    meta: { notifiesErrorItself: true },
  });

  const form = useForm<LostItemFormInput, unknown, LostItemFormValues>({
    resolver: zodResolver(lostItemFormSchema),
    defaultValues: EMPTY_LOST_ITEM_FORM,
    disabled: isPending,
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) return;

    reset(toFormValues(item));
  }, [open, item, reset]);

  const handleSubmit = form.handleSubmit((values) => mutate(toLostItemInput(values)));
  const SubmitIcon = mode.submitIcon;

  return (
    <Dialog open={open} onClose={onClose} title={mode.title}>
      <FormProvider {...form}>
        <Dialog.Form onSubmit={handleSubmit}>
          <Dialog.Body>
            <LostItemFormFields storedThumbnailUrl={item?.thumbnailUrl ?? null} />
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.Submit
              icon={<SubmitIcon fontSize="small" />}
              label={mode.submitLabel}
              loading={isPending}
            />
          </Dialog.Footer>
        </Dialog.Form>
      </FormProvider>
    </Dialog>
  );
}
