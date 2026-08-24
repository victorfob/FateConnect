import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { RIDES_QUERY_KEY } from '@app/pages/Rides/constants';
import { createRide, updateRide } from '@app/services/rides/ridesService';
import type { Ride, RideInput } from '@app/services/rides/types';
import { Dialog, Typography } from '@design-system';

import * as C from './constants';
import { toFormValues, toRideInput } from './helpers/mapper';
import { RideFormFields } from './RideFormFields';
import { EMPTY_RIDE_FORM, type RideFormInput, rideFormSchema, type RideFormValues } from './schema';
import * as S from './styles';

export type RideFormDialogProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  /** Ausente, o diálogo oferta uma carona nova; presente, edita a informada. */
  ride?: Ride;
}>;

/** Ofertar e editar são o mesmo formulário: só mudam os textos e o verbo HTTP. */
export function RideFormDialog({ open, onClose, ride }: RideFormDialogProps) {
  const queryClient = useQueryClient();
  const { notifySuccess } = useNotification();

  const mode = useMemo(() => {
    if (!ride) return C.OFFER_MODE;

    return C.EDIT_MODE;
  }, [ride]);

  const { mutate, isPending } = useMutation({
    mutationFn: (input: RideInput) => {
      if (!ride) return createRide(input);

      return updateRide(ride.id, input);
    },
    onSuccess: async () => {
      notifySuccess(mode.succeeded);
      onClose();
      await queryClient.invalidateQueries({ queryKey: [RIDES_QUERY_KEY] });
    },
    // Sem fechar no erro: refazer o formulário inteiro por causa de uma falha de
    // rede seria punir quem já digitou tudo.
    meta: { errorMessage: mode.failed },
  });

  const form = useForm<RideFormInput, unknown, RideFormValues>({
    resolver: zodResolver(rideFormSchema),
    defaultValues: EMPTY_RIDE_FORM,
    disabled: isPending,
  });
  const { reset } = form;

  // Abrir mostra a carona de agora, não o que sobrou da vez anterior.
  useEffect(() => {
    if (!open) return;

    reset(toFormValues(ride));
  }, [open, ride, reset]);

  const handleSubmit = form.handleSubmit((values) => mutate(toRideInput(values)));
  const SubmitIcon = mode.submitIcon;

  return (
    <Dialog open={open} onClose={onClose} title={mode.title}>
      <FormProvider {...form}>
        <S.RideForm component="form" onSubmit={handleSubmit} noValidate>
          <Dialog.Body>
            <RideFormFields />
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
        </S.RideForm>
      </FormProvider>
    </Dialog>
  );
}
