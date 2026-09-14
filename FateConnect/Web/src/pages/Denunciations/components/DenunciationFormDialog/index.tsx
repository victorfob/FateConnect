import { useEffect } from 'react';
import { Dialog, Typography } from '@design-system';
import { SendIcon } from '@design-system/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { createDenunciation } from '@app/services/denunciations/denunciationsService';
import type { DenunciationInput } from '@app/services/denunciations/types';

import { DenunciationFormFields } from './DenunciationFormFields';
import { toDenunciationInput } from './helpers/mapper';
import {
  denunciationFormSchema,
  EMPTY_DENUNCIATION_FORM,
  type DenunciationFormInput,
  type DenunciationFormValues,
} from './schema';
import * as C from './constants';
import * as S from './styles';

export type DenunciationFormDialogProps = Readonly<{ open: boolean; onClose: VoidFunction }>;

export function DenunciationFormDialog({ open, onClose }: DenunciationFormDialogProps) {
  const { notifySuccess } = useNotification();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: DenunciationInput) => createDenunciation(input),
    onSuccess: () => {
      notifySuccess(C.DENUNCIATION_FORM.succeeded);
      onClose();
    },
    // Não fecha no erro: refazer o formulário inteiro puniria quem já digitou.
    meta: { errorMessage: C.DENUNCIATION_FORM.failed },
  });

  const form = useForm<DenunciationFormInput, unknown, DenunciationFormValues>({
    resolver: zodResolver(denunciationFormSchema),
    defaultValues: EMPTY_DENUNCIATION_FORM,
    disabled: isPending,
  });
  const { reset } = form;

  // Abrir de novo começa em branco: denúncia não se edita, cada uma é uma nova.
  useEffect(() => {
    if (!open) return;

    reset(EMPTY_DENUNCIATION_FORM);
  }, [open, reset]);

  const handleSubmit = form.handleSubmit((values) => mutate(toDenunciationInput(values)));

  return (
    <Dialog open={open} onClose={onClose} title={C.DENUNCIATION_FORM.title}>
      <FormProvider {...form}>
        <S.DenunciationForm component="form" onSubmit={handleSubmit} noValidate>
          <Dialog.Body>
            <DenunciationFormFields />
          </Dialog.Body>

          <Dialog.Footer>
            <S.SubmitButton
              type="submit"
              variant="contained"
              color="secondary"
              fullWidth
              loading={isPending}
            >
              <SendIcon fontSize="small" />
              <Typography variant="subtitleBold" color="inherit">
                {C.DENUNCIATION_FORM.submitLabel}
              </Typography>
            </S.SubmitButton>
          </Dialog.Footer>
        </S.DenunciationForm>
      </FormProvider>
    </Dialog>
  );
}
