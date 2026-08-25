import { useEffect, useMemo } from 'react';
import { Dialog, Typography } from '@design-system';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { LOST_ITEMS_QUERY_KEY } from '@app/pages/LostAndFound/constants';
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
import * as S from './styles';

export type LostItemFormDialogProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  item?: LostItem;
}>;

export function LostItemFormDialog({ open, onClose, item }: LostItemFormDialogProps) {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();

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
    meta: { errorMessage: mode.failed },
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
        <S.LostItemForm component="form" onSubmit={handleSubmit} noValidate>
          <Dialog.Body>
            <LostItemFormFields />
          </Dialog.Body>

          <Dialog.Footer>
            <S.SubmitButton
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              loading={isPending}
            >
              <SubmitIcon fontSize="small" />
              <Typography variant="subtitleBold" color="inherit">
                {mode.submitLabel}
              </Typography>
            </S.SubmitButton>
          </Dialog.Footer>
        </S.LostItemForm>
      </FormProvider>
    </Dialog>
  );
}
