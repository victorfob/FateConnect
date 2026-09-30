import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dialog } from '@design-system';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toZonedTime } from 'date-fns-tz';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import { useNotification } from '@app/hooks/useNotification';
import { RIDES_QUERY_KEY } from '@app/pages/Rides/constants';
import { createRide, updateRide } from '@app/services/rides/ridesService';
import type { Ride, RideInput } from '@app/services/rides/types';

import { toFormValues, toRideInput } from './helpers/mapper';
import { useHolidayDays } from './hooks/useHolidayDays';
import { RideFormFields } from './RideFormFields';
import {
  createRideFormSchema,
  EMPTY_RIDE_FORM,
  type RideFormInput,
  type RideFormValues,
} from './schema';
import * as C from './constants';

const FOLLOWING_YEAR = 1;

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

  // Este ano e o seguinte cobrem o calendário que a partida alcança na prática;
  // uma partida além disso ainda é recusada pela API se cair em feriado.
  const holidayYears = useMemo(() => {
    const thisYear = toZonedTime(new Date(), C.PRODUCT_TIME_ZONE).getFullYear();

    return [thisYear, thisYear + FOLLOWING_YEAR];
  }, []);

  // Os feriados chegam depois de o formulário nascer: a validação os lê na hora,
  // em vez de no momento em que ele nasce.
  const holidaysRef = useRef<ReadonlySet<string>>(new Set());
  const resolver = useCallback<Resolver<RideFormInput, unknown, RideFormValues>>(
    (values, context, options) =>
      zodResolver(createRideFormSchema(holidaysRef.current))(values, context, options),
    [],
  );

  const form = useForm<RideFormInput, unknown, RideFormValues>({
    resolver,
    defaultValues: EMPTY_RIDE_FORM,
    disabled: isPending,
  });
  const { reset } = form;
  const holidays = useHolidayDays(holidayYears, open);

  useEffect(() => {
    holidaysRef.current = holidays;
  }, [holidays]);

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
        <Dialog.Form onSubmit={handleSubmit}>
          <Dialog.Body>
            <RideFormFields holidays={holidays} />
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
