import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { Button, Dialog, Input, ListCard, Typography } from '@design-system';

import {
  denunciationStatusLabel,
  denunciationStatusTransitions,
  isDenunciationStatus,
} from '@app/services/denunciations/denunciationStatus';
import type { Denunciation, DenunciationStatusEnum } from '@app/services/denunciations/types';

import * as C from './constants';
import * as S from './styles';

const NO_OPTION = 0;
const NO_CHOICE = '';

type DenunciationStatusActionProps = Readonly<{
  denunciation: Denunciation;
  onConfirm: (denunciation: Denunciation, status: DenunciationStatusEnum) => void;
}>;

/**
 * O seletor oferece só o que a API aceita a partir da situação atual, e some
 * quando não há destino nenhum. Nada sai sem confirmação: nenhuma transição
 * volta atrás.
 */
export function DenunciationStatusAction({
  denunciation,
  onConfirm,
}: DenunciationStatusActionProps) {
  const [chosen, setChosen] = useState<DenunciationStatusEnum | null>(null);

  const destinations = useMemo(
    () => denunciationStatusTransitions(denunciation.status),
    [denunciation.status],
  );

  const options = useMemo(
    () => [
      C.EMPTY_CHOICE,
      ...destinations.map((status) => ({
        value: status,
        label: denunciationStatusLabel(status),
      })),
    ],
    [destinations],
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!isDenunciationStatus(value)) return;

    setChosen(value);
  }, []);

  const handleDismiss = useCallback(() => setChosen(null), []);

  const handleConfirm = useCallback(() => {
    if (!chosen) return;

    setChosen(null);
    onConfirm(denunciation, chosen);
  }, [chosen, denunciation, onConfirm]);

  if (destinations.length === NO_OPTION) return null;

  return (
    <ListCard.ActionButtons>
      <S.StatusField>
        <Input.Select
          size="small"
          label={C.STATUS_SELECT_LABEL}
          options={options}
          value={NO_CHOICE}
          onChange={handleChange}
        />
      </S.StatusField>

      <Dialog
        open={chosen !== null}
        onClose={handleDismiss}
        title={`${C.STATUS_DIALOG.titlePrefix}${denunciationStatusLabel(chosen)}`}
      >
        <Dialog.Body>
          <Typography variant="subtitle">{C.STATUS_DIALOG.message}</Typography>
        </Dialog.Body>

        <Dialog.Footer>
          <Button type="button" variant="contained" color="primary" onClick={handleDismiss}>
            {C.STATUS_DIALOG.dismissLabel}
          </Button>
          <Button type="button" variant="contained" color="secondary" onClick={handleConfirm}>
            {C.STATUS_DIALOG.confirmLabel}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </ListCard.ActionButtons>
  );
}
