import { useCallback, useMemo, useState } from 'react';
import { Button, ListCard } from '@design-system';

import { reportForwardStatus } from '@app/services/reports/reportStatus';
import type { Report, ReportStatusEnum } from '@app/services/reports/types';

import { ReportStatusDialog } from '../ReportStatusDialog';
import * as C from './constants';

type ReportAdvanceActionProps = Readonly<{
  report: Report;
  onConfirm: (report: Report, status: ReportStatusEnum) => void;
}>;

export function ReportAdvanceAction({ report, onConfirm }: ReportAdvanceActionProps) {
  const [confirming, setConfirming] = useState(false);
  const target = useMemo(() => reportForwardStatus(report.status), [report.status]);

  const handleAsk = useCallback(() => setConfirming(true), []);
  const handleDismiss = useCallback(() => setConfirming(false), []);
  const handleConfirm = useCallback(() => {
    setConfirming(false);
    if (target) onConfirm(report, target);
  }, [onConfirm, report, target]);

  if (!target) return null;

  const action = C.ADVANCE_ACTIONS[target];
  if (!action) return null;

  return (
    <ListCard.BottomAction>
      <Button type="button" variant="soft" size="small" onClick={handleAsk}>
        <action.Icon fontSize="small" />
        {action.label}
      </Button>

      <ReportStatusDialog
        open={confirming}
        title={action.label}
        tone="warning"
        onDismiss={handleDismiss}
        onConfirm={handleConfirm}
      />
    </ListCard.BottomAction>
  );
}
