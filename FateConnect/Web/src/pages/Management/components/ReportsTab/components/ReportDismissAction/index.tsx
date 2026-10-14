import { useCallback, useState } from 'react';
import { IconButton } from '@design-system';
import { DeleteIcon, DeleteOutlinedIcon } from '@design-system/icons';

import { reportCanBeDismissed } from '@app/services/reports/reportStatus';
import { ReportStatusEnum, type Report } from '@app/services/reports/types';

import { ReportStatusDialog } from '../ReportStatusDialog';
import * as C from './constants';

type ReportDismissActionProps = Readonly<{
  report: Report;
  onConfirm: (report: Report, status: ReportStatusEnum) => void;
}>;

export function ReportDismissAction({ report, onConfirm }: ReportDismissActionProps) {
  const [confirming, setConfirming] = useState(false);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleDismiss = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    onConfirm(report, ReportStatusEnum.DISMISSED);
  }, [onConfirm, report]);

  if (!reportCanBeDismissed(report.status)) return null;

  return (
    <>
      <IconButton type="button" size="small" label={C.DISMISS_LABEL} onClick={handleAsk}>
        <DeleteIcon />
      </IconButton>

      <ReportStatusDialog
        open={confirming}
        title={C.DISMISS_LABEL}
        tone="error"
        icon={DeleteOutlinedIcon}
        onDismiss={handleDismiss}
        onConfirm={handleConfirm}
      />
    </>
  );
}
