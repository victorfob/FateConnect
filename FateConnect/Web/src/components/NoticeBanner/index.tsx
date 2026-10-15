import { Link as RouterLink } from 'react-router';
import { IconButton, type FeedbackTone } from '@design-system';
import { CloseIcon } from '@design-system/icons';

import type { NoticeBannerAction } from './@types';
import * as C from './constants';
import * as S from './styles';

type NoticeBannerProps = Readonly<{
  tone: FeedbackTone;
  text: string;
  action?: NoticeBannerAction;
  onDismiss: VoidFunction;
}>;

/** Faixa logo abaixo do topo da área logada, com uma ação e o fechar. */
export function NoticeBanner({ tone, text, action, onDismiss }: NoticeBannerProps) {
  return (
    <S.Banner role="status" tone={tone}>
      <S.BannerContent>
        <S.BannerText variant="caption" color="inherit">
          {text}
        </S.BannerText>

        {action && 'to' in action && (
          <S.BannerAction component={RouterLink} to={action.to} color="inherit" size="small">
            {action.label}
          </S.BannerAction>
        )}

        {action && 'onClick' in action && (
          <S.BannerAction onClick={action.onClick} color="inherit" size="small">
            {action.label}
          </S.BannerAction>
        )}
      </S.BannerContent>

      <IconButton label={C.DISMISS_BANNER_LABEL} color="inherit" size="small" onClick={onDismiss}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </S.Banner>
  );
}
