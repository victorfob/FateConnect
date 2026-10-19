import { useEffect } from 'react';
import { Dialog } from '@design-system';
import { SendIcon } from '@design-system/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';

import { useLacksContact } from '@app/hooks/useLacksContact';
import { useNotification } from '@app/hooks/useNotification';
import { REPORTS_QUERY_KEY } from '@app/pages/Reports/constants';
import { createReport } from '@app/services/reports/reportsService';
import type { ReportInput } from '@app/services/reports/types';

import { ReportFormFields } from './ReportFormFields';
import {
  EMPTY_REPORT_FORM,
  reportFormSchema,
  type ReportFormInput,
  type ReportFormValues,
} from './schema';
import * as C from './constants';
import * as S from './styles';

export type ReportFormDialogProps = Readonly<{ open: boolean; onClose: VoidFunction }>;

export function ReportFormDialog({ open, onClose }: ReportFormDialogProps) {
  const { notifySuccess } = useNotification();
  const queryClient = useQueryClient();
  const secrecyIsForced = useLacksContact();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: ReportInput) => createReport(input),
    onSuccess: async () => {
      notifySuccess(C.REPORT_FORM.succeeded);
      onClose();
      await queryClient.invalidateQueries({ queryKey: [REPORTS_QUERY_KEY] });
    },
    // Não fecha no erro: refazer o formulário inteiro puniria quem já digitou.
    meta: { errorMessage: C.REPORT_FORM.failed },
  });

  const form = useForm<ReportFormInput, unknown, ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: EMPTY_REPORT_FORM,
    disabled: isPending,
  });
  const { reset } = form;

  // Abrir de novo começa em branco: denúncia não se edita, cada uma é uma nova.
  useEffect(() => {
    if (!open) return;

    reset({ ...EMPTY_REPORT_FORM, isConfidential: secrecyIsForced });
  }, [open, reset, secrecyIsForced]);

  const handleSubmit = form.handleSubmit((values) =>
    mutate({ ...values, isConfidential: values.isConfidential || secrecyIsForced }),
  );

  return (
    <Dialog open={open} onClose={onClose} title={C.REPORT_FORM.title}>
      <FormProvider {...form}>
        <Dialog.Form onSubmit={handleSubmit}>
          <Dialog.Body>
            <S.ChannelNote variant="caption">{C.CHANNEL_NOTE}</S.ChannelNote>

            <ReportFormFields secrecyIsForced={secrecyIsForced} />
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.Submit
              icon={<SendIcon fontSize="small" />}
              label={C.REPORT_FORM.submitLabel}
              loading={isPending}
            />
          </Dialog.Footer>
        </Dialog.Form>
      </FormProvider>
    </Dialog>
  );
}
