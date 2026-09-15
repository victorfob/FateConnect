import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, ListCard, StatusTag, Typography } from '@design-system';
import {
  CalendarTodayIcon,
  ExpandLessIcon,
  ExpandMoreIcon,
  ImageIcon,
  VisibilityOffIcon,
} from '@design-system/icons';
import { format, parseISO } from 'date-fns';

import { denunciationCategoryLabel } from '@app/pages/Denunciations/helpers/denunciationCategory';
import {
  denunciationStatusLabel,
  denunciationStatusTone,
} from '@app/services/denunciations/denunciationStatus';
import type { Denunciation } from '@app/services/denunciations/types';

import * as C from './constants';
import * as S from './styles';

const DATE_FORMAT = 'dd/MM/yyyy';

type DenunciationCardProps = Readonly<{ denunciation: Denunciation }>;

export function DenunciationCard({ denunciation }: DenunciationCardProps) {
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  // Descrição que cabe nas duas linhas não ganha o gatilho: ele não teria o que
  // revelar. A medição é do estado recolhido, que é como o cartão nasce.
  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return;

    setIsTruncated(element.scrollHeight > element.clientHeight);
  }, [denunciation.description]);

  const handleToggle = useCallback(() => setIsExpanded((expanded) => !expanded), []);

  const toggleLabel = useMemo(() => {
    if (isExpanded) return C.DESCRIPTION_TOGGLE_LABELS.collapse;

    return C.DESCRIPTION_TOGGLE_LABELS.expand;
  }, [isExpanded]);

  return (
    <ListCard>
      <ListCard.Header>
        <Typography variant="subtitleBold">
          {denunciationCategoryLabel(denunciation.category)}
        </Typography>

        <ListCard.Actions>
          <StatusTag tone={denunciationStatusTone(denunciation.status)}>
            {denunciationStatusLabel(denunciation.status)}
          </StatusTag>
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        <ListCard.InfoItem>
          <CalendarTodayIcon />
          <Typography variant="caption" color="inherit">
            {format(parseISO(denunciation.createdAt), DATE_FORMAT)}
          </Typography>
        </ListCard.InfoItem>

        {denunciation.isAnonymous && (
          <ListCard.InfoItem>
            <VisibilityOffIcon />
            <Typography variant="caption" color="inherit">
              {C.DENUNCIATION_CARD_MARKERS.confidential}
            </Typography>
          </ListCard.InfoItem>
        )}

        {denunciation.hasImage && (
          <ListCard.InfoItem>
            <ImageIcon />
            <Typography variant="caption" color="inherit">
              {C.DENUNCIATION_CARD_MARKERS.photo}
            </Typography>
          </ListCard.InfoItem>
        )}
      </ListCard.InfoRow>

      <ListCard.Description>
        <S.Description
          ref={descriptionRef}
          variant="subtitle"
          color="inherit"
          isCollapsed={!isExpanded}
        >
          {denunciation.description}
        </S.Description>

        {isTruncated && (
          <S.DescriptionToggle>
            <IconButton label={toggleLabel} size="small" onClick={handleToggle}>
              {isExpanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          </S.DescriptionToggle>
        )}
      </ListCard.Description>
    </ListCard>
  );
}
