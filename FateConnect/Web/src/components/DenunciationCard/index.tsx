import type { ReactNode } from 'react';
import { ListCard, StatusTag, Typography } from '@design-system';
import { CalendarTodayIcon, IncognitoIcon } from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import { StoredPhoto } from '@app/components/StoredPhoto';
import { DESCRIPTION_TOGGLE_LABELS } from '@app/constants/cardDescription';
import { denunciationCategoryLabel } from '@app/pages/Denunciations/helpers/denunciationCategory';
import {
  denunciationStatusLabel,
  denunciationStatusTone,
} from '@app/services/denunciations/denunciationStatus';
import type { Denunciation } from '@app/services/denunciations/types';

import * as C from './constants';

const DATE_FORMAT = 'dd/MM/yyyy';

type DenunciationCardProps = Readonly<{
  denunciation: Denunciation;
  /** O contato de quem denunciou. Só a gestão o oferece: na lista de quem
   * enviou ele seria o próprio. */
  reporterContact?: ReactNode;
  /** A mudança de situação, que só a gestão faz. */
  actions?: ReactNode;
}>;

export function DenunciationCard({
  denunciation,
  reporterContact,
  actions,
}: DenunciationCardProps) {
  return (
    <ListCard
      media={
        <StoredPhoto
          url={denunciation.thumbnailUrl}
          alt={C.photoAlt(denunciation)}
          viewer={{
            title: denunciationCategoryLabel(denunciation.category),
            originalUrl: denunciation.imageUrl,
          }}
        />
      }
    >
      <ListCard.Header>
        <Typography variant="subtitleBold">
          {denunciationCategoryLabel(denunciation.category)}
        </Typography>

        <ListCard.Actions>
          <StatusTag tone={denunciationStatusTone(denunciation.status)}>
            {denunciationStatusLabel(denunciation.status)}
          </StatusTag>

          {reporterContact && <ListCard.ActionButtons>{reporterContact}</ListCard.ActionButtons>}
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        {denunciation.isAnonymous && (
          <ListCard.InfoItem>
            <IncognitoIcon />
            <Typography variant="caption" color="inherit">
              {C.DENUNCIATION_CARD_MARKERS.confidential}
            </Typography>
          </ListCard.InfoItem>
        )}

        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(denunciation.createdAt), DATE_FORMAT)}
          </Typography>
        </ListCard.InfoItem>
      </ListCard.InfoRow>

      <ListCard.Description toggleLabels={DESCRIPTION_TOGGLE_LABELS}>
        {denunciation.description}
      </ListCard.Description>

      {actions}
    </ListCard>
  );
}
