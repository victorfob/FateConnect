import type { ReactNode } from 'react';
import { ListCard, StatusTag, Typography } from '@design-system';
import { CalendarTodayIcon, IncognitoIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import { StoredPhoto } from '@app/components/StoredPhoto';
import { DESCRIPTION_TOGGLE_LABELS } from '@app/constants/cardDescription';
import { reportCategoryLabel } from '@app/pages/Reports/helpers/reportCategory';
import { reportStatusLabel, reportStatusTone } from '@app/services/reports/reportStatus';
import type { Report } from '@app/services/reports/types';

import * as C from './constants';

const DATE_FORMAT = 'dd/MM/yyyy';

type ReportCardProps = Readonly<{
  report: Report;
  /** O contato de quem denunciou e o descarte, ao lado da etiqueta. Só a gestão os
   * oferece: na lista de quem enviou o contato seria o próprio. */
  headerActions?: ReactNode;
  /** O passo adiante na situação, que só a gestão dá. */
  actions?: ReactNode;
}>;

export function ReportCard({ report, headerActions, actions }: ReportCardProps) {
  return (
    <ListCard
      media={
        <StoredPhoto
          url={report.thumbnailUrl}
          alt={C.photoAlt(report)}
          viewer={{
            title: reportCategoryLabel(report.category),
            originalUrl: report.imageUrl,
          }}
        />
      }
    >
      <ListCard.Header>
        <Typography variant="subtitleBold">{reportCategoryLabel(report.category)}</Typography>

        <ListCard.Actions>
          <StatusTag tone={reportStatusTone(report.status)}>
            {reportStatusLabel(report.status)}
          </StatusTag>

          {headerActions && <ListCard.ActionButtons>{headerActions}</ListCard.ActionButtons>}
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        {report.isAnonymous && (
          <ListCard.InfoItem>
            <IncognitoIcon />
            <Typography variant="caption" color="inherit">
              {C.REPORT_CARD_MARKERS.confidential}
            </Typography>
          </ListCard.InfoItem>
        )}

        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(report.createdAt), DATE_FORMAT)}
          </Typography>
        </ListCard.InfoItem>
      </ListCard.InfoRow>

      <ListCard.Description toggleLabels={DESCRIPTION_TOGGLE_LABELS}>
        {report.description}
      </ListCard.Description>

      {actions}
    </ListCard>
  );
}
