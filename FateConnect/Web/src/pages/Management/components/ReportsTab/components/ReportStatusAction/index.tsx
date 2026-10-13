import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { Button, Dialog, Input, ListCard } from '@design-system';

import {
  isReportStatus,
  reportStatusLabel,
  reportStatusTransitions,
} from '@app/services/reports/reportStatus';
import type { Report, ReportStatusEnum } from '@app/services/reports/types';

import * as C from './constants';
import * as S from './styles';

const NO_OPTION = 0;
const NO_CHOICE = '';

type ReportStatusActionProps = Readonly<{
  report: Report;
  onConfirm: (report: Report, status: ReportStatusEnum) => void;
}>;

/**
 * O seletor oferece só o que a API aceita a partir da situação atual, e some
 * quando não há destino nenhum. Nada sai sem confirmação: nenhuma transição
 * volta atrás.
 */
export function ReportStatusAction({ report, onConfirm }: ReportStatusActionProps) {
  const [chosen, setChosen] = useState<ReportStatusEnum | null>(null);

  const destinations = useMemo(() => reportStatusTransitions(report.status), [report.status]);

  const options = useMemo(
    () => [
      C.EMPTY_CHOICE,
      ...destinations.map((status) => ({
        value: status,
        label: reportStatusLabel(status),
      })),
    ],
    [destinations],
  );

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!isReportStatus(value)) return;

    setChosen(value);
  }, []);

  const handleDismiss = useCallback(() => setChosen(null), []);

  const handleConfirm = useCallback(() => {
    if (!chosen) return;

    setChosen(null);
    onConfirm(report, chosen);
  }, [chosen, report, onConfirm]);

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
        title={`${C.STATUS_DIALOG.titlePrefix}${reportStatusLabel(chosen)}`}
      >
        <Dialog.Body>
          <Dialog.Message tone="warning">{C.STATUS_DIALOG.message}</Dialog.Message>
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
